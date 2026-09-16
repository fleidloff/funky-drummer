import { describe, expect, it } from 'vitest'
import type { Radius, Space } from './tokens'

describe('Space', () => {
  it('holds every step of the scale', () => {
    const scale: Space[] = [0, 1, 2, 3, 4, 6, 8]

    expect(scale).toHaveLength(7)
  })

  it('rejects a raw number', () => {
    const length: number = 5

    // This assertion is held by `npm run build` (tsc), not by `npm test`:
    // widening Space to number makes the directive unused and fails the build
    // while Vitest stays green.
    // @ts-expect-error a raw length is not a Space
    const gap: Space = length

    expect(gap).toBe(5)
  })
})

describe('Radius', () => {
  it('names the two custom properties that exist', () => {
    const radii: Radius[] = ['panel', 'control']

    expect(radii).toEqual(['panel', 'control'])
  })
})
