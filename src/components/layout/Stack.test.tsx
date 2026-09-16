import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stack } from './Stack'

describe('Stack', () => {
  it('renders its children', () => {
    render(
      <Stack gap={4}>
        <span>first</span>
        <span>second</span>
      </Stack>,
    )

    expect(screen.getByText('first')).toBeInTheDocument()
    expect(screen.getByText('second')).toBeInTheDocument()
  })
})

describe('Stack alignment', () => {
  it('stretches its children by default', () => {
    render(<Stack gap={2}>Knurl</Stack>)

    expect(screen.getByText('Knurl')).toHaveClass('items-stretch')
  })

  it.each([
    ['start', 'items-start'],
    ['center', 'items-center'],
    ['end', 'items-end'],
    ['stretch', 'items-stretch'],
  ] as const)('aligns %s as %s', (align, expected) => {
    render(
      <Stack gap={2} align={align}>
        Gubbins
      </Stack>,
    )

    expect(screen.getByText('Gubbins')).toHaveClass(expected)
  })
})
