import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Glyph } from './Glyph'

describe('Glyph', () => {
  it('renders at all', () => {
    const { container } = render(<Glyph name="speaker" />)

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('is hidden from the accessibility tree', () => {
    const { container } = render(<Glyph name="speaker" />)
    const svg = container.querySelector('svg')

    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAccessibleName()
  })

  it('rejects a stray name', () => {
    // @ts-expect-error a stray string is not a valid name
    render(<Glyph name="lamp" />)
  })
})
