import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MetalSurface } from './MetalSurface'

describe('MetalSurface', () => {
  it('renders its children', () => {
    render(
      <MetalSurface radius="panel">
        <span>Gubbins</span>
      </MetalSurface>,
    )

    expect(screen.getByText('Gubbins')).toBeInTheDocument()
  })

  it('applies the panel rounding for radius="panel"', () => {
    const { container } = render(
      <MetalSurface radius="panel">
        <span>Gubbins</span>
      </MetalSurface>,
    )

    expect(container.firstChild).toHaveClass('rounded-panel')
    expect(container.firstChild).not.toHaveClass('rounded-control')
  })

  it('applies the control rounding for radius="control"', () => {
    const { container } = render(
      <MetalSurface radius="control">
        <span>Gubbins</span>
      </MetalSurface>,
    )

    expect(container.firstChild).toHaveClass('rounded-control')
    expect(container.firstChild).not.toHaveClass('rounded-panel')
  })

})
