import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageFrame } from './PageFrame'

describe('PageFrame', () => {
  it('renders its children', () => {
    render(
      <PageFrame>
        <span>first</span>
      </PageFrame>,
    )

    expect(screen.getByText('first')).toBeInTheDocument()
  })

  it('paints the bezel behind the panel', () => {
    const { container } = render(
      <PageFrame>
        <span>first</span>
      </PageFrame>,
    )

    expect(container.firstElementChild).toHaveClass('bg-bezel')
  })

  it('pads for the safe-area insets on every side', () => {
    const { container } = render(
      <PageFrame>
        <span>first</span>
      </PageFrame>,
    )

    const outer = container.firstElementChild?.className ?? ''
    expect(outer).toContain('env(safe-area-inset-top')
    expect(outer).toContain('env(safe-area-inset-right')
    expect(outer).toContain('env(safe-area-inset-bottom')
    expect(outer).toContain('env(safe-area-inset-left')
  })
})
