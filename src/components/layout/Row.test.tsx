import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Row } from './Row'
import type { Space } from '@/components/tokens'

describe('Row', () => {
  it('renders its children in order', () => {
    render(
      <Row gap={4}>
        <span>first</span>
        <span>second</span>
      </Row>,
    )

    const children = screen.getAllByText(/^(first|second)$/)
    expect(children.map((el) => el.textContent)).toEqual(['first', 'second'])
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
    const { container } = render(<Row gap={gap}>a</Row>)

    expect(container.firstElementChild).toHaveClass(expected)
  })

  it('defaults align to start', () => {
    const { container } = render(<Row gap={2}>a</Row>)

    expect(container.firstElementChild).toHaveClass('justify-start')
  })

  it.each([
    ['start', 'justify-start'],
    ['center', 'justify-center'],
    ['end', 'justify-end'],
    ['between', 'justify-between'],
  ] as const)('maps align %s to %s', (align, expected) => {
    const { container } = render(
      <Row gap={2} align={align}>
        a
      </Row>,
    )

    expect(container.firstElementChild).toHaveClass(expected)
  })

  it('rejects a raw length as a gap', () => {
    const length: number = 5

    // Held by `npm run build` (tsc), not by Vitest.
    // @ts-expect-error a raw length is not a Space
    const gap: Space = length

    expect(gap).toBe(5)
  })
})
