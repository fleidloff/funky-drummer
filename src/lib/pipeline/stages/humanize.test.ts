import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Groove } from '@/lib/groove/types'
import { LANES } from '@/lib/groove/types'
import type { Articulation, Voice } from '@/lib/kit/voices'
import { ARTICULATIONS, VOICES, voiceOf } from '@/lib/kit/voices'
import type { Bar, BarContext, BarTime, Note } from '../types'
import {
  CLAMP_BEATS,
  humanize,
  offsetFor,
  STEP_SIGMA_BEATS,
  VOICE_SIGMA_BEATS,
} from './humanize'

const DOCUMENTED_SIGMA = 0.0081
const DOCUMENTED_CLAMP = 0.024
const DOCUMENTED_STEP_SIGMA = 0.0075
const DOCUMENTED_VOICE_SIGMA = 0.003

const SWEEP_BARS = 1000
const STEPS = 16
const SWEEP_SEED = 3

const grooveOf = (): Groove => ({
  id: 'fixture',
  name: 'Fixture',
  tempo: 96,
  swing: 50,
  bars: [[]],
})

const contextOf = (seed: number): BarContext => ({
  groove: grooveOf(),
  tempo: 96,
  swingPercent: 50,
  feel: 0,
  seed,
  startTime: 0,
  startBeat: 0,
})

const articulationOf = (voice: Voice): Articulation =>
  ARTICULATIONS.find((articulation) => voiceOf(articulation) === voice) as Articulation

const noteOf = (step: number, voice: Voice): Note => ({
  step,
  lane: LANES[0],
  level: 'normal',
  voice,
  articulation: articulationOf(voice),
  velocity: 0.7,
  offsetBeats: 0,
})

const barOf = (
  index: number,
  notes: readonly Note[],
  time: BarTime | null = null,
): Bar => ({ index, time, notes })

const mean = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length

const sigma = (values: readonly number[]): number => {
  const average = mean(values)
  const variance =
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) /
    values.length
  return Math.sqrt(variance)
}

const sweep = (seed: number) => {
  const byVoice = new Map<Voice, number[]>(VOICES.map((voice) => [voice, []]))
  const all: number[] = []
  for (let barIndex = 0; barIndex < SWEEP_BARS; barIndex += 1) {
    for (let step = 0; step < STEPS; step += 1) {
      for (const voice of VOICES) {
        const offset = offsetFor(seed, barIndex, step, voice)
        all.push(offset)
        byVoice.get(voice)?.push(offset)
      }
    }
  }
  return { all, byVoice }
}

describe('the constants are the ones docs/music.md binds', () => {
  it('carries the documented per-step and per-voice sigmas', () => {
    expect(STEP_SIGMA_BEATS).toBe(DOCUMENTED_STEP_SIGMA)
    expect(VOICE_SIGMA_BEATS).toBe(DOCUMENTED_VOICE_SIGMA)
  })

  it('carries the documented clamp', () => {
    expect(CLAMP_BEATS).toBe(DOCUMENTED_CLAMP)
  })

  it('combines to the documented sigma', () => {
    expect(Math.hypot(STEP_SIGMA_BEATS, VOICE_SIGMA_BEATS)).toBeCloseTo(
      DOCUMENTED_SIGMA,
      4,
    )
  })

  it('keeps the clamp a ceiling rather than a shaper', () => {
    expect(CLAMP_BEATS / Math.hypot(STEP_SIGMA_BEATS, VOICE_SIGMA_BEATS)).toBeGreaterThan(2.5)
  })
})

describe('offsetFor', () => {
  it('spreads at the combined sigma with no bias, overall and for every voice', () => {
    const { all, byVoice } = sweep(SWEEP_SEED)

    expect(all).toHaveLength(SWEEP_BARS * STEPS * VOICES.length)
    expect(sigma(all)).toBeGreaterThan(DOCUMENTED_SIGMA * 0.97)
    expect(sigma(all)).toBeLessThan(DOCUMENTED_SIGMA * 1.02)
    expect(Math.abs(mean(all))).toBeLessThan(DOCUMENTED_SIGMA / 20)

    for (const voice of VOICES) {
      const offsets = byVoice.get(voice) ?? []
      expect(Math.abs(mean(offsets))).toBeLessThan(DOCUMENTED_SIGMA / 20)
      expect(sigma(offsets)).toBeGreaterThan(DOCUMENTED_SIGMA * 0.97)
      expect(sigma(offsets)).toBeLessThan(DOCUMENTED_SIGMA * 1.02)
    }
  })

  it('never exceeds the clamp and reaches it often enough to be live', () => {
    const { all } = sweep(SWEEP_SEED)

    const largest = all.reduce((max, value) => Math.max(max, Math.abs(value)), 0)
    expect(largest).toBeLessThanOrEqual(CLAMP_BEATS)

    const hits = all.filter((value) => Math.abs(value) === CLAMP_BEATS).length
    expect(hits).toBeGreaterThan(100)
  })

  it('separates two voices on one step by the per-voice component only, so the kit reads as one body rather than a flam', () => {
    const differences: number[] = []
    for (let barIndex = 0; barIndex < SWEEP_BARS; barIndex += 1) {
      for (let step = 0; step < STEPS; step += 1) {
        differences.push(
          offsetFor(SWEEP_SEED, barIndex, step, VOICES[0]) -
            offsetFor(SWEEP_SEED, barIndex, step, VOICES[2]),
        )
      }
    }

    const spread = sigma(differences)
    const shared = Math.SQRT2 * VOICE_SIGMA_BEATS
    const independent = Math.SQRT2 * Math.hypot(STEP_SIGMA_BEATS, VOICE_SIGMA_BEATS)

    expect(spread).toBeGreaterThan(shared * 0.85)
    expect(spread).toBeLessThan(shared * 1.2)
    expect(spread).toBeLessThan(independent * 0.5)
    expect(Math.abs(mean(differences))).toBeLessThan(DOCUMENTED_SIGMA / 20)
  })

  it('answers from its four arguments alone, in any order and however often it is called', () => {
    const forward: number[] = []
    for (let barIndex = 0; barIndex < 40; barIndex += 1) {
      for (let step = 0; step < STEPS; step += 1) {
        for (const voice of VOICES) {
          forward.push(offsetFor(SWEEP_SEED, barIndex, step, voice))
        }
      }
    }

    const reverse: number[] = []
    for (let barIndex = 39; barIndex >= 0; barIndex -= 1) {
      for (let step = STEPS - 1; step >= 0; step -= 1) {
        for (const voice of [...VOICES].reverse()) {
          reverse.push(offsetFor(SWEEP_SEED, barIndex, step, voice))
        }
      }
    }

    expect([...reverse].reverse()).toEqual(forward)
    expect(forward.every(Number.isFinite)).toBe(true)

    for (let barIndex = 0; barIndex < 40; barIndex += 1) {
      for (let step = 0; step < STEPS; step += 1) {
        for (const voice of VOICES) {
          expect(offsetFor(SWEEP_SEED, barIndex, step, voice)).toBe(
            offsetFor(SWEEP_SEED, barIndex, step, voice),
          )
        }
      }
    }
  })

  it('moves when any one of the four arguments moves', () => {
    const atClamp = (value: number) => Math.abs(value) === CLAMP_BEATS
    let compared = 0
    let equal = 0

    for (let barIndex = 0; barIndex < 50; barIndex += 1) {
      for (let step = 0; step < STEPS; step += 1) {
        const base = offsetFor(SWEEP_SEED, barIndex, step, VOICES[0])
        const neighbours = [
          offsetFor(SWEEP_SEED + 1, barIndex, step, VOICES[0]),
          offsetFor(SWEEP_SEED, barIndex + 1, step, VOICES[0]),
          offsetFor(SWEEP_SEED, barIndex, step + 1, VOICES[0]),
          offsetFor(SWEEP_SEED, barIndex, step, VOICES[1]),
        ]
        for (const neighbour of neighbours) {
          compared += 1
          if (base !== neighbour) continue
          equal += 1
          expect(atClamp(base) && atClamp(neighbour)).toBe(true)
        }
      }
    }

    expect(equal / compared).toBeLessThan(0.01)
  })

  it('keeps the all-zero input off the degenerate hash path', () => {
    const offset = offsetFor(0, 0, 0, VOICES[0])

    expect(Number.isFinite(offset)).toBe(true)
    expect(Math.abs(offset)).toBeLessThan(CLAMP_BEATS)
    expect(Math.abs(offset)).toBeGreaterThan(0)
  })

  it('is written without Math.random', () => {
    const source = readFileSync(join(import.meta.dirname, 'humanize.ts'), 'utf8')

    expect(source).not.toMatch(/Math\.random/)
  })
})

describe('humanize', () => {
  it('writes offsetBeats on every note and leaves the rest of the note alone', () => {
    const notes = VOICES.map((voice, index) => noteOf(index, voice))
    const bar = barOf(5, notes)
    const ctx = contextOf(11)

    const result = humanize(bar, ctx)

    expect(result.notes).toHaveLength(notes.length)
    result.notes.forEach((note, index) => {
      const input = notes[index]
      expect(note.offsetBeats).toBe(
        offsetFor(ctx.seed, bar.index, input.step, input.voice),
      )
      expect({ ...note, offsetBeats: input.offsetBeats }).toEqual(input)
    })
  })

  it('leaves the input bar untouched', () => {
    const notes = VOICES.map((voice, index) => noteOf(index, voice))
    const bar = barOf(5, notes)
    const before = structuredClone(bar)

    humanize(bar, contextOf(11))

    expect(bar).toEqual(before)
  })

  it('carries the bar index and time through', () => {
    const time: BarTime = { startTime: 2.5, secondsPerBeat: 0.625 }
    const bar = barOf(9, [noteOf(0, VOICES[0])], time)

    const result = humanize(bar, contextOf(11))

    expect(result.index).toBe(bar.index)
    expect(result.time).toEqual(time)
  })

  it('returns an empty bar empty', () => {
    const result = humanize(barOf(0, []), contextOf(11))

    expect(result.notes).toEqual([])
  })

  it('replays a bar offset for offset on the same seed and not on another', () => {
    const notes = VOICES.map((voice, index) => noteOf(index, voice))
    const bar = barOf(3, notes)

    const first = humanize(bar, contextOf(11)).notes.map((n) => n.offsetBeats)
    const again = humanize(bar, contextOf(11)).notes.map((n) => n.offsetBeats)
    const other = humanize(bar, contextOf(12)).notes.map((n) => n.offsetBeats)
    const later = humanize(barOf(4, notes), contextOf(11)).notes.map(
      (n) => n.offsetBeats,
    )

    expect(again).toEqual(first)
    expect(other).not.toEqual(first)
    expect(later).not.toEqual(first)
  })
})
