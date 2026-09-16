import { describe, expect, it } from 'vitest'
import { dragValue } from './dragValue'

const scale = { min: 0, max: 100, step: 1, travelPx: 160 }

describe('dragValue', () => {
  it('sweeps the whole range over one travel upward', () => {
    expect(dragValue({ ...scale, start: scale.min, deltaPx: scale.travelPx })).toBe(scale.max)
  })

  it('sweeps the whole range over one travel downward', () => {
    expect(dragValue({ ...scale, start: scale.max, deltaPx: -scale.travelPx })).toBe(scale.min)
  })

  it('clamps at the top', () => {
    expect(dragValue({ ...scale, start: 90, deltaPx: 400 })).toBe(scale.max)
  })

  it('clamps at the bottom', () => {
    expect(dragValue({ ...scale, start: 10, deltaPx: -400 })).toBe(scale.min)
  })

  it('snaps a drag to the step', () => {
    expect(dragValue({ ...scale, step: 5, start: 0, deltaPx: 18 })).toBe(10)
  })

  it('returns the start snapped when the pointer has not moved', () => {
    expect(dragValue({ ...scale, step: 5, start: 12, deltaPx: 0 })).toBe(10)
  })

  it('lands on an exact value with a fractional step', () => {
    const swept = dragValue({ min: 50, max: 66.7, step: 0.1, travelPx: 160, start: 50, deltaPx: 160 })

    expect(swept).toBe(66.7)
  })

  it('stays on the step grid when the range is not a whole number of steps', () => {
    expect(dragValue({ min: 0, max: 10, step: 3, travelPx: 160, start: 0, deltaPx: 400 })).toBe(9)
  })

  it('moves a fraction of the range for a fraction of the travel', () => {
    expect(dragValue({ min: 60, max: 180, step: 1, travelPx: 160, start: 60, deltaPx: 40 })).toBe(90)
  })
})
