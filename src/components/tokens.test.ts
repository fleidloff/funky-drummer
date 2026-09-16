import { describe, expect, it } from 'vitest'
import type { Columns, Radius, Space, Tone } from './tokens'

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

describe('Tone', () => {
  it('names the three tones that exist', () => {
    const tones: Tone[] = ['amber', 'green', 'steel']

    expect(tones).toHaveLength(3)
  })

  it('rejects an arbitrary string', () => {
    const label: string = 'amber'

    // This assertion is held by `npm run build` (tsc), not by `npm test`:
    // widening Tone to string makes the directive unused and fails the build
    // while Vitest stays green.
    // @ts-expect-error an arbitrary string is not a Tone
    const tone: Tone = label

    expect(tone).toBe('amber')
  })
})

describe('Columns', () => {
  it('holds the two grid widths that exist', () => {
    const columns: Columns[] = [2, 4]

    expect(columns).toHaveLength(2)
  })

  it('rejects a raw number', () => {
    const count: number = 3

    // This assertion is held by `npm run build` (tsc), not by `npm test`:
    // widening Columns to number makes the directive unused and fails the build
    // while Vitest stays green.
    // @ts-expect-error a raw number is not a Columns
    const columns: Columns = count

    expect(columns).toBe(3)
  })
})
