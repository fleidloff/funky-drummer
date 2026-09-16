import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Grid } from './Grid'
import type { Columns, Space } from '@/components/tokens'

describe('Grid', () => {
  it('renders its children in order', () => {
    render(
      <Grid columns={4} gap={2}>
        <span>first</span>
        <span>second</span>
      </Grid>,
    )

    const children = screen.getAllByText(/^(first|second)$/)
    expect(children.map((el) => el.textContent)).toEqual(['first', 'second'])
  })

  it.each([
    [2, 'grid-cols-2'],
    [4, 'grid-cols-4'],
  ] as const)('reaches the DOM as %s columns -> %s', (columns, expected) => {
    const { container } = render(
      <Grid columns={columns} gap={2}>
        a
      </Grid>,
    )

    expect(container.firstElementChild).toHaveClass(expected)
  })

  it.each([
    [0, 'gap-0'],
    [1, 'gap-1'],
    [2, 'gap-2'],
    [3, 'gap-3'],
    [4, 'gap-4'],
    [6, 'gap-6'],
    [8, 'gap-8'],
  ] as const)('reaches the DOM as gap %s -> %s', (gap, expected) => {
    const { container } = render(
      <Grid columns={4} gap={gap}>
        a
      </Grid>,
    )

    expect(container.firstElementChild).toHaveClass(expected)
  })

  it('rejects a raw length as a gap', () => {
    const length: number = 5

    // @ts-expect-error a raw length is not a Space
    const gap: Space = length

    expect(gap).toBe(5)
  })

  it('rejects a raw number as columns', () => {
    const count: number = 3

    // @ts-expect-error a raw number is not Columns
    const columns: Columns = count

    expect(columns).toBe(3)
  })
})
