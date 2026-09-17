import { execFile, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'
import { KIT } from './manifest'
import { ARTICULATIONS } from './voices'

const run = promisify(execFile)

const root = join(import.meta.dirname, '..', '..', '..')
const publicDir = join(root, 'public')

const SAMPLE_RATE = 44_100
const ONSET_FLOOR_DB = -40
const ONSET_FLOOR = 10 ** (ONSET_FLOOR_DB / 20)
const TOLERANCE_DB = 0.5
const CONCURRENCY = 4

const INSTALL_HINT =
  'ffmpeg is not on PATH, and the level of the committed samples is measured with it rather than asserted from a note. Install it: `brew install ffmpeg` on macOS, `apt install ffmpeg` on Debian or Ubuntu.'

const windowSamples = Math.round((KIT.rmsWindowMs / 1000) * SAMPLE_RATE)

const declaredFiles = [
  ...new Set(
    ARTICULATIONS.flatMap((articulation) => {
      const entry = KIT.samples[articulation]
      return entry.kind === 'files' ? entry.files : []
    }),
  ),
]

type Measurement =
  | { readonly file: string; readonly kind: 'measured'; readonly rmsDb: number }
  | {
      readonly file: string
      readonly kind: 'tooShort'
      readonly durationMs: number
      readonly onsetMs: number
      readonly availableMs: number
    }

const msOf = (samples: number) => Math.round(((samples * 1000) / SAMPLE_RATE) * 10) / 10

async function decodeMono(file: string, servedPath: string): Promise<Float32Array> {
  const args = [
    '-hide_banner',
    '-nostats',
    '-loglevel',
    'error',
    '-i',
    file,
    '-map',
    '0:a:0',
    '-ac',
    '1',
    '-ar',
    String(SAMPLE_RATE),
    '-f',
    'f32le',
    '-',
  ]
  const { stdout } = await run('ffmpeg', args, {
    encoding: 'buffer',
    maxBuffer: 1 << 26,
  }).catch((cause: NodeJS.ErrnoException) => {
    if (cause.code === 'ENOENT') throw new Error(INSTALL_HINT)
    throw cause
  })
  const pcm = new Float32Array(Math.floor(stdout.length / 4))
  for (let index = 0; index < pcm.length; index += 1) {
    pcm[index] = stdout.readFloatLE(index * 4)
  }
  if (pcm.length === 0) {
    throw new Error(`ffmpeg decoded no audio from ${servedPath}`)
  }
  return pcm
}

async function measure(servedPath: string): Promise<Measurement> {
  const file = join(publicDir, servedPath)
  if (!existsSync(file)) {
    throw new Error(
      `${servedPath} is declared in the manifest but ${relative(root, file)} does not exist`,
    )
  }
  const pcm = await decodeMono(file, servedPath)
  const onset = pcm.findIndex((sample) => Math.abs(sample) >= ONSET_FLOOR)
  if (onset < 0) {
    throw new Error(
      `${servedPath} never rises above ${ONSET_FLOOR_DB} dBFS — it is silent, so it has no onset to measure from`,
    )
  }

  const available = pcm.length - onset
  if (available < windowSamples) {
    return {
      file: servedPath,
      kind: 'tooShort',
      durationMs: msOf(pcm.length),
      onsetMs: msOf(onset),
      availableMs: msOf(available),
    }
  }

  let sum = 0
  for (let index = onset; index < onset + windowSamples; index += 1) {
    sum += pcm[index] * pcm[index]
  }
  const rms = Math.sqrt(sum / windowSamples)
  return { file: servedPath, kind: 'measured', rmsDb: Math.round(20 * Math.log10(rms) * 10) / 10 }
}

async function mapBounded<In, Out>(
  items: readonly In[],
  limit: number,
  work: (item: In) => Promise<Out>,
): Promise<Out[]> {
  const results: Out[] = []
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await work(items[index])
    }
  })
  await Promise.all(workers)
  return results
}

let pending: Promise<Measurement[]> | undefined
const measurements = () => (pending ??= mapBounded(declaredFiles, CONCURRENCY, measure))

describe(`every sample sits at one RMS level over the ${KIT.rmsWindowMs} ms after its onset`, () => {
  it('finds ffmpeg on PATH, without which nothing below can be measured', () => {
    expect(spawnSync('ffmpeg', ['-version']).status, INSTALL_HINT).toBe(0)
  })

  it('declares at least one file, without which the two measurements below prove nothing', () => {
    expect(
      declaredFiles.length,
      'the manifest declares no sample files, so the two measurements below pass over an empty list',
    ).toBeGreaterThan(0)
  })

  it(`carries ${KIT.rmsWindowMs} ms of audio after the onset, so the window is never padded with silence`, async () => {
    const short = (await measurements()).filter((result) => result.kind === 'tooShort')
    expect(
      short.map((result) => result.file),
      `shorter than the ${KIT.rmsWindowMs} ms window, so their level would be averaged against silence:\n${short
        .map(
          (result) =>
            result.kind === 'tooShort' &&
            `${result.file} is ${result.durationMs} ms long with its onset at ${result.onsetMs} ms, leaving ${result.availableMs} ms`,
        )
        .join('\n')}`,
    ).toEqual([])
  }, 120_000)

  it(`measures every file within ${TOLERANCE_DB} dB of the kit's targetRmsDb`, async () => {
    const off = (await measurements()).filter(
      (result) =>
        result.kind === 'measured' &&
        Math.abs(result.rmsDb - KIT.targetRmsDb) > TOLERANCE_DB,
    )
    expect(
      off.map((result) => result.file),
      `off ${KIT.targetRmsDb} dBFS by more than ${TOLERANCE_DB} dB:\n${off
        .map((result) => result.kind === 'measured' && `${result.file} measured ${result.rmsDb} dBFS`)
        .join('\n')}`,
    ).toEqual([])
  }, 120_000)
})
