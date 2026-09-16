import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TickArc } from './TickArc'

describe('TickArc', () => {
  it('renders at all', () => {
    const { container } = render(<TickArc count={5} />)

    expect(container.firstElementChild).toBeInTheDocument()
  })

  it.each([0, 1, 5, 11])('renders exactly count marks for %i', (count) => {
    const { container } = render(<TickArc count={count} />)

    expect(container.querySelectorAll('[data-mark="tick"]')).toHaveLength(count)
  })

  it('is hidden from the accessibility tree', () => {
    const { container } = render(<TickArc count={5} />)

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstElementChild).not.toHaveAccessibleName()
  })
})
