import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TickBar } from './TickBar'

describe('TickBar', () => {
  it('renders at all', () => {
    const { container } = render(<TickBar count={5} />)

    expect(container.firstElementChild).toBeInTheDocument()
  })

  it.each([0, 1, 5, 9])('renders exactly count marks for %i', (count) => {
    const { container } = render(<TickBar count={count} />)

    expect(container.querySelectorAll('[data-mark="tick"]')).toHaveLength(count)
  })

  it('is hidden from the accessibility tree', () => {
    const { container } = render(<TickBar count={5} />)

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstElementChild).not.toHaveAccessibleName()
  })
})
