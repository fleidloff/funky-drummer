import { describe, expect, it } from 'vitest'
import type { Groove, Lane, Level } from '@/lib/groove/types'
import { LANES, STEPS_PER_BAR } from '@/lib/groove/types'
import type { Articulation, Voice } from '@/lib/kit/voices'
import { BEATS_PER_BAR, STEPS_PER_BEAT } from '@/lib/time/grid'
import type { Bar, BarContext, BarTime, Note } from '../types'
import {
  BAR_CURVE_MAX,
  BAR_CURVE_MIN,
  PHRASE_BARS,
  PHRASE_CURVE_MAX,
  PHRASE_CURVE_MIN,
  barCurve,
  isExempt,
  phraseCurve,
  velocity,
} from './velocity'

const LEVELS: readonly Level[] = ['ghost', 'normal', 'accent', 'anchor']

const LEVEL_VELOCITY: Record<Level, number> = {
  ghost: 0.3,
  normal: 0.65,
  accent: 0.85,
  anchor: 1,
}

const ARTICULATION_OF: Record<Voice, Articulation> = {
  kick: 'kick.soft',
  snare: 'snare.normal',
  hihat: 'hihat.closed',
  ride: 'ride.bow',
  cowbell: 'cowbell.hit',
  shaker: 'shaker.hit',
  toms: 'toms.rack',
  crash: 'crash.hit',
}

const voiceOf = (lane: Lane): Voice =>
  lane === 'tom1' || lane === 'tom2' ? 'toms' : lane

const noteOf = (over: Partial<Note> = {}): Note => {
  const lane = over.lane ?? 'kick'
  const level = over.level ?? 'normal'
  const voice = voiceOf(lane)
  return {
    step: 0,
    lane,
    level,
    voice,
    articulation: ARTICULATION_OF[voice],
    velocity: LEVEL_VELOCITY[level],
    offsetBeats: 0,
    ...over,
  }
}

const barOf = (
  index: number,
  notes: readonly Note[],
  time: BarTime | null = null,
): Bar => ({ index, time, notes })

const GROOVE: Groove = {
  id: 'fixture',
  name: 'Fixture',
  tempo: 96,
  swing: 50,
  bars: [[]],
}

const CTX: BarContext = {
  groove: GROOVE,
  tempo: 96,
  swingPercent: 50,
  feel: 0,
  seed: 7,
  startTime: 0,
  startBeat: 0,
}

const steps = Array.from({ length: STEPS_PER_BAR }, (_, step) => step)
const DOCUMENTED_BAR_MIN = 0.92
const DOCUMENTED_BAR_MAX = 1.05
const DOCUMENTED_PHRASE_MIN = 0.9
const DOCUMENTED_PHRASE_MAX = 1.08
const DOCUMENTED_PHRASE_BARS = 4
const DOCUMENTED_PHRASE_TABLE = [0.9, 0.98, 1.04, 1.08]

const phraseIndices = Array.from({ length: PHRASE_BARS }, (_, index) => index)
const twoPhrases = Array.from(
  { length: PHRASE_BARS * 2 },
  (_, index) => index,
)
const middleStep = STEPS_PER_BAR / 2
const nonExempt = LEVELS.filter((level) => level !== 'anchor')

const only = (bar: Bar): Note => {
  const [note] = velocity(bar, CTX).notes
  expect(note).toBeDefined()
  return note
}

describe('the curves are the ones docs/music.md binds', () => {
  it('carries the documented per-bar range', () => {
    expect(BAR_CURVE_MIN).toBe(DOCUMENTED_BAR_MIN)
    expect(BAR_CURVE_MAX).toBe(DOCUMENTED_BAR_MAX)
  })

  it('carries the documented phrase range and length', () => {
    expect(PHRASE_CURVE_MIN).toBe(DOCUMENTED_PHRASE_MIN)
    expect(PHRASE_CURVE_MAX).toBe(DOCUMENTED_PHRASE_MAX)
    expect(PHRASE_BARS).toBe(DOCUMENTED_PHRASE_BARS)
  })

  it('plays the documented four phrase values in order', () => {
    expect(phraseIndices.map(phraseCurve)).toEqual(DOCUMENTED_PHRASE_TABLE)
  })

  it('plays the documented arc across the bar', () => {
    expect(barCurve(0)).toBeCloseTo(DOCUMENTED_BAR_MIN, 10)
    expect(barCurve(8)).toBeCloseTo(DOCUMENTED_BAR_MAX, 10)
    expect(barCurve(4)).toBeCloseTo(1.0119, 4)
    expect(barCurve(12)).toBeCloseTo(1.0119, 4)
  })
})

describe('barCurve', () => {
  it('stays inside its declared range and reaches both ends', () => {
    const values = steps.map(barCurve)
    const outside = values.filter(
      (value) => value < BAR_CURVE_MIN || value > BAR_CURVE_MAX,
    )

    expect(outside).toEqual([])
    expect(Math.min(...values)).toBeCloseTo(BAR_CURVE_MIN, 10)
    expect(Math.max(...values)).toBeCloseTo(BAR_CURVE_MAX, 10)
  })

  it('touches its minimum on the first step and nowhere else', () => {
    const at = steps.filter((step) => barCurve(step) <= BAR_CURVE_MIN + 1e-9)

    expect(at).toEqual([0])
  })

  it('touches its maximum in the middle of the bar and nowhere else', () => {
    const at = steps.filter((step) => barCurve(step) >= BAR_CURVE_MAX - 1e-9)

    expect(at).toEqual([middleStep])
  })

  it('is symmetric about its peak', () => {
    const asymmetric = steps
      .slice(1)
      .filter(
        (step) =>
          Math.abs(barCurve(step) - barCurve(STEPS_PER_BAR - step)) > 1e-12,
      )

    expect(asymmetric).toEqual([])
  })

  it('rises to the peak and settles back towards the One', () => {
    const rising = steps
      .slice(1, middleStep + 1)
      .every((step) => barCurve(step) > barCurve(step - 1))
    const falling = steps
      .slice(middleStep + 1)
      .every((step) => barCurve(step) < barCurve(step - 1))

    expect(rising).toBe(true)
    expect(falling).toBe(true)
  })

  it('redistributes inside the bar rather than lifting it', () => {
    const mean =
      steps.reduce((total, step) => total + barCurve(step), 0) / STEPS_PER_BAR

    expect(Math.abs(mean - 1)).toBeLessThan(0.003)
  })
})

describe('phraseCurve', () => {
  it('stays inside its declared range and reaches both ends', () => {
    const values = twoPhrases.map(phraseCurve)
    const outside = values.filter(
      (value) => value < PHRASE_CURVE_MIN || value > PHRASE_CURVE_MAX,
    )

    expect(outside).toEqual([])
    expect(Math.min(...values)).toBeCloseTo(PHRASE_CURVE_MIN, 10)
    expect(Math.max(...values)).toBeCloseTo(PHRASE_CURVE_MAX, 10)
  })

  it('drops back on the first bar of a phrase and builds into the last', () => {
    const lowest = phraseIndices.filter(
      (index) => phraseCurve(index) <= PHRASE_CURVE_MIN + 1e-9,
    )
    const highest = phraseIndices.filter(
      (index) => phraseCurve(index) >= PHRASE_CURVE_MAX - 1e-9,
    )

    expect(lowest).toEqual([0])
    expect(highest).toEqual([PHRASE_BARS - 1])
  })

  it('builds by shrinking increments', () => {
    const increments = phraseIndices
      .slice(1)
      .map((index) => phraseCurve(index) - phraseCurve(index - 1))
    const shrinking = increments
      .slice(1)
      .every((increment, at) => increment < increments[at])

    expect(increments.every((increment) => increment > 0)).toBe(true)
    expect(shrinking).toBe(true)
  })

  it('repeats with the phrase length, including at large bar indices', () => {
    const indices = Array.from({ length: 4096 }, (_, index) => index).concat(
      Number.MAX_SAFE_INTEGER - PHRASE_BARS * 3,
    )
    const drifted = indices.filter(
      (index) => phraseCurve(index) !== phraseCurve(index + PHRASE_BARS),
    )

    expect(drifted).toEqual([])
  })

  it('redistributes across the phrase rather than lifting it', () => {
    const mean =
      phraseIndices.reduce((total, index) => total + phraseCurve(index), 0) /
      PHRASE_BARS

    expect(mean).toBeCloseTo(1, 12)
  })
})

describe('isExempt', () => {
  it('exempts the anchors and nothing else', () => {
    const exempt = LEVELS.filter((level) => isExempt(noteOf({ level })))

    expect(exempt).toEqual(['anchor'])
  })

  it('reads the level alone, on every lane and every step', () => {
    const wrong = LANES.flatMap((lane) =>
      steps.flatMap((step) =>
        LEVELS.filter(
          (level) =>
            isExempt(noteOf({ lane, level, step })) !== (level === 'anchor'),
        ).map((level) => `${lane}/${level}/${step}`),
      ),
    )

    expect(wrong).toEqual([])
  })
})

describe('velocity', () => {
  it('leaves an anchor at exactly its level value on every lane, step and bar', () => {
    const moved = LANES.flatMap((lane) =>
      twoPhrases.flatMap((index) =>
        steps
          .map((step) => noteOf({ lane, level: 'anchor', step }))
          .filter(
            (note) =>
              only(barOf(index, [note])).velocity !== LEVEL_VELOCITY.anchor,
          )
          .map((note) => `${lane}/${note.step}/${index}`),
      ),
    )

    expect(moved).toEqual([])
  })

  it('keeps the four anchor kicks of a four-on-the-floor even', () => {
    const quarters = Array.from(
      { length: BEATS_PER_BAR },
      (_, beat) => beat * STEPS_PER_BEAT,
    )
    const kicks = quarters.map((step) =>
      noteOf({ lane: 'kick', level: 'anchor', step }),
    )

    for (const index of twoPhrases) {
      const played = velocity(barOf(index, kicks), CTX).notes
      const levels = played.map((note) => note.velocity)

      expect(new Set(levels).size).toBe(1)
      expect(levels).toEqual(quarters.map(() => LEVEL_VELOCITY.anchor))
    }
  })

  it('multiplies every other note by both curves', () => {
    for (const level of nonExempt) {
      for (const step of steps) {
        for (const index of twoPhrases) {
          const note = noteOf({ level, step })
          const played = only(barOf(index, [note]))

          expect(played.velocity).toBeCloseTo(
            note.velocity * barCurve(step) * phraseCurve(index),
            12,
          )
        }
      }
    }
  })

  it('cannot emit a velocity that clips against the voice gain', () => {
    const emitted = nonExempt.flatMap((level) =>
      steps.flatMap((step) =>
        twoPhrases.map(
          (index) => only(barOf(index, [noteOf({ level, step })])).velocity,
        ),
      ),
    )
    const loudest = Math.max(...emitted)
    const quietest = Math.min(...emitted)

    expect(loudest).toBeLessThan(1)
    expect(loudest).toBeCloseTo(
      LEVEL_VELOCITY.accent * BAR_CURVE_MAX * PHRASE_CURVE_MAX,
      12,
    )
    expect(quietest).toBeGreaterThan(0)
    expect(quietest).toBeCloseTo(
      LEVEL_VELOCITY.ghost * BAR_CURVE_MIN * PHRASE_CURVE_MIN,
      12,
    )
  })

  it('keeps every velocity it emits normalized, anchors included', () => {
    const emitted = LEVELS.flatMap((level) =>
      steps.flatMap((step) =>
        twoPhrases.map(
          (index) => only(barOf(index, [noteOf({ level, step })])).velocity,
        ),
      ),
    )

    expect(Math.max(...emitted)).toBeLessThanOrEqual(1)
    expect(Math.min(...emitted)).toBeGreaterThan(0)
  })

  it('moves nothing on a note but its velocity', () => {
    for (const level of LEVELS) {
      for (const lane of LANES) {
        const note = noteOf({ lane, level, step: 5, offsetBeats: 0.017 })
        const played = only(barOf(2, [note]))

        expect(played.step).toBe(note.step)
        expect(played.lane).toBe(note.lane)
        expect(played.level).toBe(note.level)
        expect(played.voice).toBe(note.voice)
        expect(played.articulation).toBe(note.articulation)
        expect(played.offsetBeats).toBe(note.offsetBeats)
      }
    }
  })

  it('leaves the bar it was given alone', () => {
    const notes = LEVELS.map((level, step) => noteOf({ level, step }))
    const bar = barOf(3, notes, { startTime: 1.5, secondsPerBeat: 0.625 })
    const before = structuredClone(bar)

    velocity(bar, CTX)

    expect(bar).toEqual(before)
  })

  it('keeps the bar index and the bar time', () => {
    const time: BarTime = { startTime: 1.5, secondsPerBeat: 0.625 }
    const bar = barOf(3, [noteOf()], time)

    const played = velocity(bar, CTX)

    expect(played.index).toBe(bar.index)
    expect(played.time).toEqual(time)
  })

  it('is a function of the bar alone', () => {
    const bar = barOf(
      6,
      LEVELS.map((level, step) => noteOf({ level, step })),
    )

    expect(velocity(bar, CTX)).toEqual(velocity(bar, CTX))
  })

  it('returns an empty bar empty', () => {
    expect(velocity(barOf(1, []), CTX).notes).toEqual([])
  })
})
