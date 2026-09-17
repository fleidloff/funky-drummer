import { describe, expect, it } from 'vitest'
import { STRAIGHT_PERCENT, barSeconds, noteTime, secondsPerBeat, stepBeats } from './grid'

const SWING_MIN_PERCENT = 50
const SWING_MAX_PERCENT = 66.7

const DRIFT_TEMPO = 110
const DRIFT_BARS = 1000
const exactAt110 = (bar: number, step: number) => ((16 * bar + step) * 3) / 22

describe('secondsPerBeat', () => {
  it('is sixty over the tempo', () => {
    expect(secondsPerBeat(96)).toBe(0.625)
    expect(secondsPerBeat(120)).toBe(0.5)
    expect(secondsPerBeat(60)).toBe(1)
  })
})

describe('barSeconds', () => {
  it('is four beats', () => {
    expect(barSeconds(96)).toBe(2.5)
    expect(barSeconds(120)).toBe(2)
    expect(barSeconds(DRIFT_TEMPO)).toBeCloseTo(4 * (60 / DRIFT_TEMPO), 10)
  })
})

describe('stepBeats', () => {
  it('puts four steps in a beat', () => {
    expect(stepBeats(0, STRAIGHT_PERCENT)).toBe(0)
    expect(stepBeats(4, STRAIGHT_PERCENT)).toBe(1)
    expect(stepBeats(6, STRAIGHT_PERCENT)).toBe(1.5)
    expect(stepBeats(15, STRAIGHT_PERCENT)).toBe(3.75)
  })
})

describe('noteTime', () => {
  it('lands the sixteen steps of a bar where arithmetic says at 96 BPM', () => {
    const spb = secondsPerBeat(96)
    for (let step = 0; step < 16; step += 1) {
      expect(noteTime(0, spb, step, 0, STRAIGHT_PERCENT)).toBeCloseTo((step / 4) * 0.625, 10)
    }
    expect(noteTime(0, spb, 0, 0, STRAIGHT_PERCENT)).toBe(0)
    expect(noteTime(0, spb, 4, 0, STRAIGHT_PERCENT)).toBe(0.625)
    expect(noteTime(0, spb, 8, 0, STRAIGHT_PERCENT)).toBe(1.25)
    expect(noteTime(0, spb, 12, 0, STRAIGHT_PERCENT)).toBe(1.875)
  })

  it('keeps the bar line as the origin', () => {
    expect(noteTime(7.5, secondsPerBeat(96), 0, 0, STRAIGHT_PERCENT)).toBe(7.5)
  })

  it('shifts a note by exactly that many beats in both directions', () => {
    const spb = secondsPerBeat(96)
    expect(noteTime(0, spb, 4, 0.5, STRAIGHT_PERCENT)).toBeCloseTo(0.625 + 0.3125, 10)
    expect(noteTime(0, spb, 4, -0.5, STRAIGHT_PERCENT)).toBeCloseTo(0.625 - 0.3125, 10)
    expect(noteTime(0, spb, 4, 0.1, STRAIGHT_PERCENT) - noteTime(0, spb, 4, 0, STRAIGHT_PERCENT)).toBeCloseTo(
      0.1 * spb,
      10,
    )
    expect(noteTime(0, spb, 4, -0.1, STRAIGHT_PERCENT) - noteTime(0, spb, 4, 0, STRAIGHT_PERCENT)).toBeCloseTo(
      -0.1 * spb,
      10,
    )
  })
})

describe('a thousand bars', () => {
  it('reaches bar 1000 in one multiplication, and accumulating does not', () => {
    const direct = DRIFT_BARS * barSeconds(DRIFT_TEMPO)

    let accumulated = 0
    for (let bar = 0; bar < DRIFT_BARS; bar += 1) accumulated += barSeconds(DRIFT_TEMPO)

    expect(noteTime(direct, secondsPerBeat(DRIFT_TEMPO), 0, 0, STRAIGHT_PERCENT)).toBe(direct)
    expect(direct).toBeCloseTo(exactAt110(DRIFT_BARS, 0), 10)
    expect(accumulated).not.toBe(direct)
    expect(Math.abs(accumulated - direct)).toBeGreaterThan(0)
  })

  it('places every step within a millisecond of its intended time', () => {
    const spb = secondsPerBeat(DRIFT_TEMPO)
    let worst = 0

    for (let bar = 0; bar < DRIFT_BARS; bar += 1) {
      const start = bar * barSeconds(DRIFT_TEMPO)
      for (let step = 0; step < 16; step += 1) {
        const error = Math.abs(
          noteTime(start, spb, step, 0, STRAIGHT_PERCENT) - exactAt110(bar, step),
        )
        worst = Math.max(worst, error)
      }
    }

    expect(worst).toBeLessThan(0.001)
  })

  it('states swing as a percentage, inside the range a groove declares one in', () => {
    expect(STRAIGHT_PERCENT).toBeGreaterThanOrEqual(SWING_MIN_PERCENT)
    expect(STRAIGHT_PERCENT).toBeLessThanOrEqual(SWING_MAX_PERCENT)
  })

})
