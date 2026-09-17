import { describe, expect, it } from 'vitest'
import { gaussian, hashOf, mix32, unitFloat } from './hash'

const SWEEP = 100_000

const sweep = <T,>(count: number, of: (index: number) => T): readonly T[] =>
  Array.from({ length: count }, (_, index) => of(index))

const meanOf = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length

const sigmaOf = (values: readonly number[]): number => {
  const mean = meanOf(values)
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

describe('mix32', () => {
  it('is a pure function of its input', () => {
    for (let value = -50; value < 50; value += 1) {
      expect(mix32(value)).toBe(mix32(value))
    }
  })

  it('returns a 32-bit integer', () => {
    for (let value = 0; value < 1000; value += 1) {
      const hash = mix32(value)
      expect(Number.isInteger(hash)).toBe(true)
      expect(hash).toBeGreaterThanOrEqual(-0x80000000)
      expect(hash).toBeLessThanOrEqual(0x7fffffff)
    }
  })

  it('separates neighbouring inputs', () => {
    const seen = new Set(sweep(10_000, mix32))
    expect(seen.size).toBe(10_000)
  })
})

describe('hashOf', () => {
  it('is a pure function of its arguments', () => {
    expect(hashOf(7, 3, 9)).toBe(hashOf(7, 3, 9))
    expect(hashOf(0)).toBe(hashOf(0))
  })

  it('returns a non-negative integer below 2^32', () => {
    for (let index = 0; index < 5000; index += 1) {
      const hash = hashOf(index, index * 3, index % 7)
      expect(Number.isInteger(hash)).toBe(true)
      expect(hash).toBeGreaterThanOrEqual(0)
      expect(hash).toBeLessThan(0x1_0000_0000)
    }
  })

  it('is order-sensitive', () => {
    expect(hashOf(1, 2, 3)).not.toBe(hashOf(1, 3, 2))
    expect(hashOf(1, 2)).not.toBe(hashOf(2, 1))
  })

  it('answers differently for a different argument count', () => {
    expect(hashOf(4, 0)).not.toBe(hashOf(4))
  })

  it('spreads a dense grid of inputs without collapsing', () => {
    const values = new Set<number>()
    for (let a = 0; a < 64; a += 1) {
      for (let b = 0; b < 64; b += 1) {
        values.add(hashOf(11, a, b))
      }
    }
    expect(values.size).toBe(64 * 64)
  })
})

describe('unitFloat', () => {
  it('stays inside the open unit interval', () => {
    for (let index = 0; index < 20_000; index += 1) {
      const value = unitFloat(hashOf(index, index * 31))
      expect(value).toBeGreaterThan(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('never returns zero, which Box–Muller would take the log of', () => {
    for (const hash of [0, -0x8000_0000, 0xffff_ffff, 0x1_0000_0000]) {
      const value = unitFloat(hash)
      expect(value).toBeGreaterThan(0)
      expect(Number.isFinite(Math.log(value))).toBe(true)
    }
  })

  it('is uniform enough that its mean sits at a half', () => {
    const values = sweep(SWEEP, (index) => unitFloat(hashOf(index)))
    expect(meanOf(values)).toBeCloseTo(0.5, 2)
  })
})

describe('gaussian', () => {
  const draws = sweep(SWEEP, (index) =>
    gaussian(hashOf(index, 0), hashOf(index, 1)),
  )

  it('is a pure function of its two hashes', () => {
    expect(gaussian(3, 4)).toBe(gaussian(3, 4))
  })

  it('has a mean of zero', () => {
    expect(Math.abs(meanOf(draws))).toBeLessThan(0.02)
  })

  it('has a standard deviation of one', () => {
    expect(Math.abs(sigmaOf(draws) - 1)).toBeLessThan(0.02)
  })

  it('is finite everywhere, including at the extremes of its inputs', () => {
    for (const a of [0, 1, -1, 0x7fff_ffff, -0x8000_0000, 0xffff_ffff]) {
      for (const b of [0, 1, -1, 0x7fff_ffff, -0x8000_0000, 0xffff_ffff]) {
        expect(Number.isFinite(gaussian(a, b))).toBe(true)
      }
    }
  })

  it('puts about two thirds of its draws inside one sigma', () => {
    const inside = draws.filter((draw) => Math.abs(draw) <= 1).length
    expect(inside / draws.length).toBeCloseTo(0.6827, 2)
  })

  it('changes when either hash changes', () => {
    expect(gaussian(5, 6)).not.toBe(gaussian(6, 6))
    expect(gaussian(5, 6)).not.toBe(gaussian(5, 7))
  })
})
