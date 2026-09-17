import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type {
  Bar as GridBar,
  GridNote,
  Groove,
  Lane,
  Level,
} from '@/lib/groove/types'
import { LANES } from '@/lib/groove/types'
import type { Articulation, Voice } from '@/lib/kit/voices'
import type { Bar, BarContext, BarTime } from '../types'
import { baseBeat, variantFor } from './baseBeat'

const LEVELS: readonly Level[] = ['ghost', 'normal', 'accent', 'anchor']

const grid = (
  lane: Lane,
  level: Level,
  step = 0,
  flags: { open?: true; bell?: true } = {},
): GridNote => ({ step, lane, level, ...flags })

const grooveOf = (...bars: readonly GridBar[]): Groove => ({
  id: 'fixture',
  name: 'Fixture',
  tempo: 96,
  swing: 50,
  bars,
})

const contextOf = (groove: Groove, seed = 7): BarContext => ({
  groove,
  tempo: 96,
  swingPercent: 50,
  feel: 0,
  seed,
  startTime: 0,
  startBeat: 0,
})

const barOf = (index: number, time: BarTime | null = null): Bar => ({
  index,
  time,
  notes: [],
})

const playOne = (note: GridNote, seed = 7) => {
  const groove = grooveOf([note])
  return baseBeat(barOf(0), contextOf(groove, seed)).notes[0]
}

const TABLE: readonly (readonly [Lane, Level, Voice, Articulation])[] = [
  ['kick', 'anchor', 'kick', 'kick.hard'],
  ['kick', 'accent', 'kick', 'kick.hard'],
  ['kick', 'normal', 'kick', 'kick.soft'],
  ['kick', 'ghost', 'kick', 'kick.soft'],
  ['snare', 'anchor', 'snare', 'snare.backbeat'],
  ['snare', 'accent', 'snare', 'snare.backbeat'],
  ['snare', 'normal', 'snare', 'snare.normal'],
  ['snare', 'ghost', 'snare', 'snare.ghost'],
  ['hihat', 'anchor', 'hihat', 'hihat.accent'],
  ['hihat', 'accent', 'hihat', 'hihat.accent'],
  ['hihat', 'normal', 'hihat', 'hihat.closed'],
  ['hihat', 'ghost', 'hihat', 'hihat.closed'],
  ['ride', 'anchor', 'ride', 'ride.bow'],
  ['ride', 'accent', 'ride', 'ride.bow'],
  ['ride', 'normal', 'ride', 'ride.bow'],
  ['ride', 'ghost', 'ride', 'ride.bow'],
  ['cowbell', 'anchor', 'cowbell', 'cowbell.hit'],
  ['cowbell', 'accent', 'cowbell', 'cowbell.hit'],
  ['cowbell', 'normal', 'cowbell', 'cowbell.hit'],
  ['cowbell', 'ghost', 'cowbell', 'cowbell.hit'],
  ['shaker', 'anchor', 'shaker', 'shaker.hit'],
  ['shaker', 'accent', 'shaker', 'shaker.hit'],
  ['shaker', 'normal', 'shaker', 'shaker.hit'],
  ['shaker', 'ghost', 'shaker', 'shaker.hit'],
  ['tom1', 'anchor', 'toms', 'toms.rack'],
  ['tom1', 'accent', 'toms', 'toms.rack'],
  ['tom1', 'normal', 'toms', 'toms.rack'],
  ['tom1', 'ghost', 'toms', 'toms.rack'],
  ['tom2', 'anchor', 'toms', 'toms.floor'],
  ['tom2', 'accent', 'toms', 'toms.floor'],
  ['tom2', 'normal', 'toms', 'toms.floor'],
  ['tom2', 'ghost', 'toms', 'toms.floor'],
  ['crash', 'anchor', 'crash', 'crash.hit'],
  ['crash', 'accent', 'crash', 'crash.hit'],
  ['crash', 'normal', 'crash', 'crash.hit'],
  ['crash', 'ghost', 'crash', 'crash.hit'],
]

describe('the lane and level table', () => {
  it.each(TABLE)('%s at %s plays %s %s', (lane, level, voice, articulation) => {
    const note = playOne(grid(lane, level))
    expect(note.voice).toBe(voice)
    expect(note.articulation).toBe(articulation)
  })

  it('covers every lane the grid can carry', () => {
    const covered = new Set(TABLE.map(([lane]) => lane))
    expect([...covered].sort()).toEqual([...LANES].sort())
  })

  it('answers every level on every lane without throwing', () => {
    for (const lane of LANES) {
      for (const level of LEVELS) {
        expect(() => playOne(grid(lane, level))).not.toThrow()
      }
    }
  })

  it('sends anchor and accent to the same articulation on every lane', () => {
    for (const lane of LANES) {
      expect(playOne(grid(lane, 'anchor')).articulation).toBe(
        playOne(grid(lane, 'accent')).articulation,
      )
    }
  })
})

describe('the flags', () => {
  it.each(LEVELS)('open beats the level on a %s hihat', (level) => {
    const note = playOne(grid('hihat', level, 0, { open: true }))
    expect(note.voice).toBe('hihat')
    expect(note.articulation).toBe('hihat.open')
  })

  it.each(LEVELS)('bell beats the level on a %s ride', (level) => {
    const note = playOne(grid('ride', level, 0, { bell: true }))
    expect(note.voice).toBe('ride')
    expect(note.articulation).toBe('ride.bell')
  })

  it('leaves the velocity to the level', () => {
    expect(playOne(grid('hihat', 'ghost', 0, { open: true })).velocity).toBe(0.3)
    expect(playOne(grid('ride', 'normal', 0, { bell: true })).velocity).toBe(0.65)
  })
})

describe('velocity', () => {
  it('is the bare level value', () => {
    expect(playOne(grid('snare', 'anchor')).velocity).toBe(1)
    expect(playOne(grid('hihat', 'accent')).velocity).toBe(0.85)
    expect(playOne(grid('hihat', 'normal')).velocity).toBe(0.65)
    expect(playOne(grid('snare', 'ghost')).velocity).toBe(0.3)
  })

  it('carries no voice gain, whatever the voice', () => {
    for (const lane of LANES) {
      expect(playOne(grid(lane, 'anchor')).velocity).toBe(1)
      expect(playOne(grid(lane, 'ghost')).velocity).toBe(0.3)
    }
  })
})

describe('the shape of the bar', () => {
  const fullBar: GridBar = LANES.map((lane, index) =>
    grid(lane, LEVELS[index % LEVELS.length], index),
  )

  it('turns every grid note into exactly one note', () => {
    const out = baseBeat(barOf(0), contextOf(grooveOf(fullBar)))
    expect(out.notes).toHaveLength(fullBar.length)
  })

  it('passes step and lane through unchanged', () => {
    const out = baseBeat(barOf(0), contextOf(grooveOf(fullBar)))
    expect(out.notes.map((note) => [note.step, note.lane])).toEqual(
      fullBar.map((note) => [note.step, note.lane]),
    )
  })

  it('gives every note an offset of zero', () => {
    const out = baseBeat(barOf(0), contextOf(grooveOf(fullBar)))
    for (const note of out.notes) expect(note.offsetBeats).toBe(0)
  })

  it('returns no notes for an empty bar', () => {
    const out = baseBeat(barOf(0), contextOf(grooveOf([])))
    expect(out.notes).toEqual([])
  })

  it('leaves a null time alone', () => {
    const out = baseBeat(barOf(3), contextOf(grooveOf(fullBar)))
    expect(out.time).toBeNull()
    expect(out.index).toBe(3)
  })

  it('leaves a real time alone', () => {
    const time: BarTime = { startTime: 12.5, secondsPerBeat: 0.625 }
    const out = baseBeat(barOf(2, time), contextOf(grooveOf(fullBar)))
    expect(out.time).toBe(time)
    expect(out.index).toBe(2)
  })

  it('replaces the notes it was handed', () => {
    const seeded: Bar = {
      index: 0,
      time: null,
      notes: [
        {
          step: 15,
          lane: 'crash',
          voice: 'crash',
          articulation: 'crash.hit',
          velocity: 0.5,
          offsetBeats: 0.25,
        },
      ],
    }
    const out = baseBeat(seeded, contextOf(grooveOf([grid('kick', 'anchor')])))
    expect(out.notes).toHaveLength(1)
    expect(out.notes[0].lane).toBe('kick')
  })
})

describe('choosing the bar of the groove', () => {
  const one = grooveOf([grid('kick', 'anchor', 0)])
  const two = grooveOf(
    [grid('kick', 'anchor', 0)],
    [grid('snare', 'ghost', 5)],
  )

  it('repeats a one-bar groove at every index', () => {
    const at = (index: number) => baseBeat(barOf(index), contextOf(one)).notes
    expect(at(1)).toEqual(at(0))
    expect(at(2)).toEqual(at(0))
    expect(at(3)).toEqual(at(0))
  })

  it('alternates a two-bar groove on index modulo two', () => {
    const laneAt = (index: number) =>
      baseBeat(barOf(index), contextOf(two)).notes[0].lane
    expect(laneAt(0)).toBe('kick')
    expect(laneAt(1)).toBe('snare')
    expect(laneAt(2)).toBe('kick')
    expect(laneAt(3)).toBe('snare')
    expect(laneAt(8)).toBe('kick')
    expect(laneAt(9)).toBe('snare')
  })
})

describe('purity', () => {
  it('mutates neither the bar nor the context', () => {
    const groove = grooveOf([grid('snare', 'ghost', 2), grid('kick', 'anchor', 4)])
    const ctx = contextOf(groove)
    const time: BarTime = { startTime: 1, secondsPerBeat: 0.5 }
    const bar = barOf(1, time)
    const barBefore = structuredClone(bar)
    const ctxBefore = structuredClone(ctx)

    baseBeat(bar, ctx)

    expect(bar).toEqual(barBefore)
    expect(ctx).toEqual(ctxBefore)
    expect(bar.notes).toEqual([])
  })

  it('reads no randomness', () => {
    const source = readFileSync(join(import.meta.dirname, 'baseBeat.ts'), 'utf8')
    expect(source).not.toMatch(/Math\.random/)
    expect(source).not.toMatch(/Date\.now|performance\.now/)
  })
})

describe('variantFor', () => {
  it('is a non-negative integer', () => {
    for (let step = 0; step < 16; step += 1) {
      for (const lane of LANES) {
        const variant = variantFor(12345, 3, step, lane)
        expect(Number.isInteger(variant)).toBe(true)
        expect(variant).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('gives the same answer for the same four inputs', () => {
    expect(variantFor(99, 40, 9, 'snare')).toBe(variantFor(99, 40, 9, 'snare'))
    expect(variantFor(0, 0, 0, 'kick')).toBe(variantFor(0, 0, 0, 'kick'))
  })

  it('changes when the seed changes', () => {
    const a = Array.from({ length: 16 }, (_, step) =>
      variantFor(1, 0, step, 'hihat'),
    )
    const b = Array.from({ length: 16 }, (_, step) =>
      variantFor(2, 0, step, 'hihat'),
    )
    expect(b).not.toEqual(a)
  })

  it('changes when the bar index changes', () => {
    const at = (barIndex: number) =>
      Array.from({ length: 16 }, (_, step) =>
        variantFor(5, barIndex, step, 'snare'),
      )
    expect(at(1)).not.toEqual(at(0))
    expect(at(2)).not.toEqual(at(1))
  })

  it('changes when the step changes', () => {
    const variants = Array.from({ length: 16 }, (_, step) =>
      variantFor(5, 0, step, 'shaker'),
    )
    expect(new Set(variants).size).toBeGreaterThan(1)
  })

  it('changes when the lane changes', () => {
    const variants = LANES.map((lane) => variantFor(5, 0, 7, lane))
    expect(new Set(variants).size).toBeGreaterThan(1)
  })

  it('does not repeat one step across bars', () => {
    const drawn = Array.from({ length: 24 }, (_, barIndex) =>
      variantFor(5, barIndex, 11, 'snare') % 3,
    )
    expect(new Set(drawn).size).toBeGreaterThan(1)
  })

  it('draws two lanes on one step independently', () => {
    const pairs = Array.from({ length: 24 }, (_, barIndex) => [
      variantFor(5, barIndex, 2, 'snare') % 3,
      variantFor(5, barIndex, 2, 'hihat') % 3,
    ])
    expect(pairs.some(([snare, hihat]) => snare !== hihat)).toBe(true)
    expect(pairs.some(([snare, hihat]) => snare === hihat)).toBe(true)
  })

  it('spreads three files over a long run of one ghost note', () => {
    const counts = [0, 0, 0]
    for (let barIndex = 0; barIndex < 200; barIndex += 1) {
      counts[variantFor(31, barIndex, 14, 'snare') % 3] += 1
    }
    for (const count of counts) expect(count).toBeGreaterThan(30)
  })
})
