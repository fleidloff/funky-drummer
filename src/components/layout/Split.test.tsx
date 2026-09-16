import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Split } from './Split'
import type { Space } from '@/components/tokens'

describe('Split', () => {
  it('renders start before end in the DOM at every width', () => {
    render(<Split gap={4} start={<span>first</span>} end={<span>second</span>} />)

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
    const { container } = render(<Split gap={gap} start={<span>a</span>} end={<span>b</span>} />)

    expect(container.firstElementChild).toHaveClass(expected)
  })

  it('rejects a raw length as a gap', () => {
    const length: number = 5

    // @ts-expect-error a raw length is not a Space
    const gap: Space = length

    expect(gap).toBe(5)
  })
})

describe('Split at the breakpoint', () => {
  it('stacks below the breakpoint and goes two-up above it', () => {
    render(<Split gap={4} start={<span>Knurl</span>} end={<span>Gubbins</span>} />)

    const frame = screen.getByText('Knurl').parentElement?.parentElement

    expect(frame).toHaveClass('flex-col', 'md:flex-row')
  })
})
