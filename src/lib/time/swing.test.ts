import { describe, expect, it } from 'vitest'
import { STEPS_PER_BEAT, STRAIGHT_PERCENT, secondsPerBeat } from './grid'
import { swungStepBeats } from './swing'

const SWING_MAX_PERCENT = 66.7
const TRIPLET_PERCENT = 200 / 3
const STEPS_PER_BAR = 16
const EAR_TEMPO = 96
const MS_PER_SECOND = 1000
const TRIPLET_GAP_MAX_MS = 0.11

const percentsAcrossTheRange = Array.from(
  { length: Math.round((SWING_MAX_PERCENT - STRAIGHT_PERCENT) * 10) + 1 },
  (_, index) => STRAIGHT_PERCENT + index / 10,
)

const percentForRatio = (ratio: number) => (ratio / (1 + ratio)) * 100

const PUBLISHED = [
  { ratio: 1.07, percent: 51.7 },
  { ratio: 1.3, percent: 56.5 },
  { ratio: 1.6, percent: 61.5 },
  { ratio: 1.8, percent: 64.3 },
]

const pairRatio = (pairStart: number, percent: number) => {
  const first = swungStepBeats(pairStart + 1, percent) - swungStepBeats(pairStart, percent)
  const second = swungStepBeats(pairStart + 2, percent) - swungStepBeats(pairStart + 1, percent)
  return first / second
}

describe('swungStepBeats', () => {
  it('is the straight grid at fifty percent', () => {
    for (let step = 0; step < STEPS_PER_BAR; step += 1) {
      expect(swungStepBeats(step, STRAIGHT_PERCENT)).toBe(step / STEPS_PER_BEAT)
    }
  })

  it('never moves an even step, at any percentage in the range', () => {
    for (const percent of percentsAcrossTheRange) {
      for (let step = 0; step < STEPS_PER_BAR; step += 2) {
        expect(swungStepBeats(step, percent)).toBe(step / STEPS_PER_BEAT)
      }
    }
  })

  it('delays an odd step, further at every percentage up the range', () => {
    for (let step = 1; step < STEPS_PER_BAR; step += 2) {
      let previous = -Infinity
      for (const percent of percentsAcrossTheRange) {
        const beats = swungStepBeats(step, percent)
        expect(beats).toBeGreaterThanOrEqual(step / STEPS_PER_BEAT)
        expect(beats).toBeGreaterThan(previous)
        previous = beats
      }
    }
  })

  it('keeps every step inside its own pair', () => {
    for (const percent of percentsAcrossTheRange) {
      for (let step = 1; step < STEPS_PER_BAR; step += 1) {
        expect(swungStepBeats(step, percent)).toBeGreaterThan(swungStepBeats(step - 1, percent))
      }
    }
  })

  it('reaches a triplet at the top of the knob, to a tenth of a millisecond at 96 BPM', () => {
    const gapMs =
      (swungStepBeats(1, SWING_MAX_PERCENT) - swungStepBeats(1, TRIPLET_PERCENT)) *
      secondsPerBeat(EAR_TEMPO) *
      MS_PER_SECOND

    expect(Math.abs(gapMs)).toBeLessThan(TRIPLET_GAP_MAX_MS)
  })

  it('makes a pair two to one at a full triplet', () => {
    expect(pairRatio(0, TRIPLET_PERCENT)).toBeCloseTo(2, 10)
    expect(pairRatio(0, STRAIGHT_PERCENT)).toBeCloseTo(1, 10)
  })

  it('places a pair at the ratio docs/music.md publishes for its percentage', () => {
    for (const { ratio, percent } of PUBLISHED) {
      expect(pairRatio(0, percent)).toBeCloseTo(ratio, 2)
    }
  })

  it('warps a pair by exactly the ratio its percentage came from', () => {
    for (const ratio of [1.07, 1.3, 1.6, 1.8]) {
      for (let pairStart = 0; pairStart < STEPS_PER_BAR - 2; pairStart += 2) {
        expect(pairRatio(pairStart, percentForRatio(ratio))).toBeCloseTo(ratio, 10)
      }
    }
  })
})
