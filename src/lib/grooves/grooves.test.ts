import { readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LANES, STEPS_PER_BAR, type Groove } from '../groove/types'
import { GROOVES, STRAIGHT_SIXTEEN } from './index'

const TEMPO_MIN = 60
const TEMPO_MAX = 180
const SWING_MIN = 50
const SWING_MAX = 66.7

const KEBAB_CASE = /^[a-z]+(?:-[a-z]+)*$/

const lanes = new Set<string>(LANES)

const ids = GROOVES.map((groove) => groove.id)

const fileNames = readdirSync(import.meta.dirname)
  .filter((name) => name.endsWith('.ts') && name !== 'index.ts' && !name.includes('.test.'))
  .map((name) => name.slice(0, -'.ts'.length))

const failing = (wrong: (groove: Groove) => boolean) =>
  GROOVES.filter(wrong).map((groove) => groove.id)

describe('the groove library', () => {
  it('parses at import and holds at least the ten grids of docs/music.md Part 2', () => {
    expect(GROOVES.length).toBeGreaterThanOrEqual(10)
  })

  it('gives every groove one or two bars', () => {
    expect(failing((groove) => groove.bars.length < 1 || groove.bars.length > 2)).toEqual([])
  })

  it('gives every groove a unique id', () => {
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([])
  })

  it('writes every id in kebab-case', () => {
    expect(ids.filter((id) => !KEBAB_CASE.test(id))).toEqual([])
  })

  it('names every groove file after the id it exports', () => {
    expect(ids.filter((id) => !fileNames.includes(id))).toEqual([])
  })

  it('exports every groove file through GROOVES', () => {
    expect(fileNames.filter((name) => !ids.includes(name))).toEqual([])
  })

  it('gives every groove a name', () => {
    const unnamed = (groove: Groove) =>
      typeof groove.name !== 'string' || groove.name.trim() === ''

    expect(failing(unnamed)).toEqual([])
  })

  it('keeps every tempo inside the range docs/music.md Part 4 gives', () => {
    expect(failing((groove) => groove.tempo < TEMPO_MIN || groove.tempo > TEMPO_MAX)).toEqual([])
  })

  it('keeps every swing inside the range docs/music.md Part 4 gives', () => {
    expect(failing((groove) => groove.swing < SWING_MIN || groove.swing > SWING_MAX)).toEqual([])
  })

  it('points a secondary One at a bar the groove has', () => {
    const wrong = (groove: Groove) => {
      const bar = groove.secondaryOne
      if (bar === undefined) return false
      return !Number.isInteger(bar) || bar < 1 || bar > groove.bars.length
    }

    expect(failing(wrong)).toEqual([])
  })

  it('places every note on a step of the grid and a lane of the kit', () => {
    const stray = GROOVES.flatMap((groove) =>
      groove.bars.flatMap((bar, index) =>
        bar
          .filter(
            (note) =>
              !Number.isInteger(note.step) ||
              note.step < 0 ||
              note.step >= STEPS_PER_BAR ||
              !lanes.has(note.lane),
          )
          .map(() => `${groove.id} bar ${index + 1}`),
      ),
    )

    expect(stray).toEqual([])
  })

  it('draws STRAIGHT_SIXTEEN from the library', () => {
    expect(GROOVES).toContain(STRAIGHT_SIXTEEN)
  })
})
