import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import { KIT } from './manifest'
import { ARTICULATIONS, VOICES, type Articulation } from './voices'

const root = join(import.meta.dirname, '..', '..', '..')
const publicDir = join(root, 'public')
const servedRoot = '/samples/'
const samplesDir = join(publicDir, servedRoot)
const samplesDoc = join(root, 'docs', 'samples.md')

const rel = (file: string) => relative(root, file)
const onDisk = (served: string) => join(publicDir, served)
const servedPathOf = (file: string) =>
  `/${relative(publicDir, file).split(sep).join('/')}`

function oggFilesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return oggFilesUnder(full)
    return entry.name.endsWith('.ogg') ? [full] : []
  })
}

const declaredBy = new Map<string, Articulation[]>()
for (const articulation of ARTICULATIONS) {
  const entry = KIT.samples[articulation]
  if (entry.kind !== 'files') continue
  for (const file of entry.files) {
    declaredBy.set(file, [...(declaredBy.get(file) ?? []), articulation])
  }
}
const declaredFiles = [...declaredBy.keys()]

const EVERY_ARTICULATION: Record<Articulation, true> = {
  'kick.hard': true,
  'kick.soft': true,
  'snare.backbeat': true,
  'snare.normal': true,
  'snare.ghost': true,
  'snare.crossStick': true,
  'hihat.closed': true,
  'hihat.accent': true,
  'hihat.open': true,
  'hihat.pedal': true,
  'ride.bow': true,
  'ride.bell': true,
  'cowbell.hit': true,
  'shaker.hit': true,
  'toms.rack': true,
  'toms.floor': true,
  'crash.hit': true,
}

const musicDoc = join(root, 'docs', 'music.md')

function gainsFromMusicMd(): Record<string, number> {
  const rows = readFileSync(musicDoc, 'utf8')
    .split('\n')
    .map((line) => line.match(/^\|\s*([A-Za-z-]+)\s*\|\s*-?\u2212?\d+ dB\s*\|\s*([\d.]+)\s*\|$/))
    .filter((match) => match !== null)
  return Object.fromEntries(
    rows.map((match) => [match[1].toLowerCase().replace('-', ''), Number(match[2])]),
  )
}

describe('ARTICULATIONS enumerates the union', () => {
  it('lists every member of Articulation — the exhaustiveness is held by tsc, not by this run', () => {
    expect([...ARTICULATIONS].sort()).toEqual(Object.keys(EVERY_ARTICULATION).sort())
  })

  it('lists each articulation exactly once', () => {
    expect(ARTICULATIONS).toHaveLength(Object.keys(EVERY_ARTICULATION).length)
    expect(new Set(ARTICULATIONS).size).toBe(ARTICULATIONS.length)
  })
})

describe('the manifest and public/samples/ agree in both directions', () => {
  it('has every path it declares on disk under public/', () => {
    const wrongRoot = declaredFiles.filter((file) => !file.startsWith(servedRoot))
    expect(
      wrongRoot,
      `these are not served paths rooted at ${servedRoot}: ${wrongRoot.join(', ')}`,
    ).toEqual([])

    const missing = declaredFiles.filter((file) => !existsSync(onDisk(file)))
    expect(
      missing,
      `declared in the manifest but missing from public/: ${missing
        .map((file) => `${file} -> ${rel(onDisk(file))}`)
        .join(', ')}`,
    ).toEqual([])
  })

  it('names every .ogg on disk by exactly one entry', () => {
    expect(
      existsSync(samplesDir),
      `${rel(samplesDir)} does not exist — the sample pack has not been added`,
    ).toBe(true)

    const present = oggFilesUnder(samplesDir).map(servedPathOf).sort()
    const undeclared = present.filter((file) => !declaredBy.has(file))
    expect(
      undeclared,
      `on disk but named by no manifest entry: ${undeclared.join(', ')}`,
    ).toEqual([])

    const doubled = [...declaredBy].filter(([, articulations]) => articulations.length > 1)
    expect(
      doubled.map(([file]) => file),
      `named by more than one entry: ${doubled
        .map(([file, articulations]) => `${file} (${articulations.join(', ')})`)
        .join('; ')}`,
    ).toEqual([])
  })
})

describe('every articulation resolves to a recording', () => {
  it('resolves to at least one file, and a substitution resolves in one hop', () => {
    const unresolved = ARTICULATIONS.flatMap((articulation) => {
      const entry = KIT.samples[articulation]
      if (entry.kind === 'files') {
        return entry.files.length > 0 ? [] : [`${articulation} declares no files`]
      }
      if (!ARTICULATIONS.includes(entry.by)) {
        return [`${articulation} is substituted by ${entry.by}, which is not an articulation`]
      }
      const target = KIT.samples[entry.by]
      if (target.kind !== 'files') {
        return [`${articulation} is substituted by ${entry.by}, which is itself substituted`]
      }
      return target.files.length > 0
        ? []
        : [`${articulation} is substituted by ${entry.by}, which declares no files`]
    })
    expect(unresolved, `unresolved articulations:\n${unresolved.join('\n')}`).toEqual([])
  })

  it('gives snare.ghost its own recording, which docs/music.md forbids substituting', () => {
    expect(KIT.samples['snare.ghost'].kind).toBe('files')
  })
})

describe('the pack is documented and mixed as docs/music.md says', () => {
  it('writes every declared file into docs/samples.md, so none ships without its licence', () => {
    expect(
      existsSync(samplesDoc),
      `${rel(samplesDoc)} does not exist — every sample needs its source and licence recorded`,
    ).toBe(true)

    const documented = readFileSync(samplesDoc, 'utf8')
    const undocumented = declaredFiles.filter((file) => !documented.includes(file))
    expect(
      undocumented,
      `declared in the manifest but not written in ${rel(samplesDoc)}: ${undocumented.join(', ')}`,
    ).toEqual([])
  })

  it('carries the eight linear gains read out of docs/music.md Part 3', () => {
    const fromDoc = gainsFromMusicMd()
    expect(
      Object.keys(fromDoc).sort(),
      `${rel(musicDoc)} must state a linear gain for all eight voices`,
    ).toEqual([...VOICES].sort())
    expect(KIT.gains, `KIT.gains disagrees with the table in ${rel(musicDoc)}`).toEqual(fromDoc)
  })
})

describe('docs/samples.md carries what the pack claims', () => {
  const rows = readFileSync(samplesDoc, 'utf8')
    .split('\n')
    .filter((line) => line.startsWith('|') && line.includes('/samples/'))
    .map((line) => {
      const cells = line.split('|').map((cell) => cell.trim())
      return {
        file: cells.find((cell) => cell.includes('/samples/'))?.replaceAll('`', '') ?? '',
        licence: cells.filter(Boolean).at(-1) ?? '',
      }
    })

  it('gives every declared file a row naming a licence, not just a mention in prose', () => {
    const rowFor = new Map(rows.map((row) => [row.file, row.licence]))
    const withoutRow = declaredFiles.filter((file) => !rowFor.has(file))
    expect(
      withoutRow,
      `declared in the manifest but has no row in ${rel(samplesDoc)}: ${withoutRow.join(', ')}`,
    ).toEqual([])
  })

  it('licenses every file CC0 or CC-BY, which is what spec.md allows', () => {
    const wrong = rows.filter((row) => !/^CC0\b|^CC BY\b/.test(row.licence))
    expect(
      wrong.map((row) => `${row.file} is "${row.licence}"`),
      'every sample must be CC0 or CC-BY',
    ).toEqual([])
  })

  it('writes out an attribution for every CC-BY source, which the licence requires', () => {
    const doc = readFileSync(samplesDoc, 'utf8')
    const needsAttribution = rows.some((row) => /^CC BY\b/.test(row.licence))
    const attribution = doc.split('### Attribution')[1]?.split('\n## ')[0]?.trim() ?? ''
    expect(
      needsAttribution ? attribution.length : 0,
      `${rel(samplesDoc)} ships CC-BY files but its Attribution section is empty`,
    ).toBeGreaterThan(needsAttribution ? 0 : -1)
  })

  it('states the same normalization constants the manifest uses', () => {
    const doc = readFileSync(samplesDoc, 'utf8')
    expect(doc, `${rel(samplesDoc)} must state targetRmsDb as ${KIT.targetRmsDb}`).toContain(
      `${Math.abs(KIT.targetRmsDb).toFixed(1)} dBFS`,
    )
    expect(doc, `${rel(samplesDoc)} must state rmsWindowMs as ${KIT.rmsWindowMs}`).toContain(
      `${KIT.rmsWindowMs} ms`,
    )
  })
})
