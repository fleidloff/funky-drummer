import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
// Importing .ts needs Node >= 22.18 for unflagged type stripping; package.json's
// engines floor is lower because the app itself does not need it.
import { KIT } from '../src/lib/kit/manifest.ts'

const run = promisify(execFile)

const root = fileURLToPath(new URL('..', import.meta.url))
const publicDir = join(root, 'public')

const SAMPLE_RATE = 44_100
const ONSET_FLOOR = 10 ** (-40 / 20)
const QUALITY = '5'
const SETTLED_DB = 0.1
const MAX_PASSES = 4

const windowSamples = Math.round((KIT.rmsWindowMs / 1000) * SAMPLE_RATE)

const declared = [
  ...new Set(
    Object.values(KIT.samples).flatMap((entry) => (entry.kind === 'files' ? entry.files : [])),
  ),
]

async function decodeMono(file) {
  const { stdout } = await run(
    'ffmpeg',
    [
      '-hide_banner', '-nostats', '-loglevel', 'error',
      '-i', file,
      '-map', '0:a:0', '-ac', '1', '-ar', String(SAMPLE_RATE),
      '-f', 'f32le', '-',
    ],
    { encoding: 'buffer', maxBuffer: 1 << 28 },
  )
  const pcm = new Float32Array(Math.floor(stdout.length / 4))
  for (let index = 0; index < pcm.length; index += 1) pcm[index] = stdout.readFloatLE(index * 4)
  return pcm
}

function levelDb(pcm, served) {
  const onset = pcm.findIndex((sample) => Math.abs(sample) >= ONSET_FLOOR)
  if (onset < 0) throw new Error(`${served} never rises above -40 dBFS, so it has no onset`)
  if (pcm.length - onset < windowSamples) {
    throw new Error(
      `${served} carries only ${Math.round(((pcm.length - onset) * 1000) / SAMPLE_RATE)} ms after its onset, less than the ${KIT.rmsWindowMs} ms window`,
    )
  }
  let sum = 0
  for (let index = onset; index < onset + windowSamples; index += 1) sum += pcm[index] * pcm[index]
  return 20 * Math.log10(Math.sqrt(sum / windowSamples))
}

async function encode(pcm, gain, out) {
  const raw = Buffer.alloc(pcm.length * 4)
  let peak = 0
  for (let index = 0; index < pcm.length; index += 1) {
    const sample = pcm[index] * gain
    peak = Math.max(peak, Math.abs(sample))
    raw.writeFloatLE(sample, index * 4)
  }
  if (peak >= 1) {
    throw new Error(
      `${out} would peak at ${(20 * Math.log10(peak)).toFixed(2)} dBFS — targetRmsDb is too high for this file's crest factor`,
    )
  }
  const staged = join(tmpdir(), `normalize-samples-${process.pid}.f32`)
  await writeFile(staged, raw)
  try {
    await run('ffmpeg', [
      '-hide_banner', '-nostats', '-loglevel', 'error', '-y',
      '-f', 'f32le', '-ar', String(SAMPLE_RATE), '-ac', '1',
      '-i', staged,
      '-c:a', 'libvorbis', '-q:a', QUALITY, '-ar', String(SAMPLE_RATE), '-ac', '1',
      out,
    ])
  } finally {
    await unlink(staged)
  }
  return peak
}

let rewritten = 0
for (const served of declared) {
  const file = join(publicDir, served)
  if (!existsSync(file)) throw new Error(`${served} is declared in the manifest but ${relative(root, file)} does not exist`)

  const original = await decodeMono(file)
  const before = levelDb(original, served)

  let gain = 10 ** ((KIT.targetRmsDb - before) / 20)
  let after = before
  let peak = 0
  let passes = 0
  while (Math.abs(after - KIT.targetRmsDb) > SETTLED_DB && passes < MAX_PASSES) {
    peak = await encode(original, gain, file)
    after = levelDb(await decodeMono(file), served)
    gain *= 10 ** ((KIT.targetRmsDb - after) / 20)
    passes += 1
  }
  if (passes > 0) rewritten += 1
  if (Math.abs(after - KIT.targetRmsDb) > SETTLED_DB) {
    throw new Error(`${served} settled at ${after.toFixed(2)} dBFS after ${passes} passes`)
  }

  const summary = passes === 0
    ? 'already at target'
    : `${before.toFixed(2)} -> ${after.toFixed(2)} dBFS, peak ${(20 * Math.log10(peak)).toFixed(2)} dBFS, ${passes} pass${passes === 1 ? '' : 'es'}`
  console.log(`${served.padEnd(30)} ${summary}`)
}

console.log(`\n${declared.length} files at ${KIT.targetRmsDb} dBFS over ${KIT.rmsWindowMs} ms from onset, ${rewritten} rewritten`)
