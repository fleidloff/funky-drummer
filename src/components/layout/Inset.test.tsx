import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Inset } from './Inset'
import type { Space } from '@/components/tokens'

describe('Inset', () => {
  it('renders its children', () => {
    render(<Inset pad={4}>Knurl</Inset>)

    expect(screen.getByText('Knurl')).toBeInTheDocument()
  })

  it.each([
    [0, 'p-0'],
    [1, 'p-1'],
    [2, 'p-2'],
    [3, 'p-3'],
    [4, 'p-4'],
    [6, 'p-6'],
    [8, 'p-8'],
  ] as const)('pads %i with %s', (pad, expected) => {
    render(<Inset pad={pad}>Gubbins</Inset>)

    expect(screen.getByText('Gubbins')).toHaveClass(expected)
  })

  it('rejects a raw length', () => {
    const length: number = 5

    // This assertion is held by `npm run build` (tsc), not by `npm test`:
    // widening Space to number makes the directive unused and fails the build
    // while Vitest stays green.
    // @ts-expect-error a raw length is not a Space
    const pad: Space = length

    expect(pad).toBe(5)
  })
})
