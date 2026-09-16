import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EngravedPlate } from './EngravedPlate'

describe('EngravedPlate', () => {
  it('renders its children', () => {
    render(
      <EngravedPlate>
        <span>Knurl</span>
      </EngravedPlate>,
    )

    expect(screen.getByText('Knurl')).toBeInTheDocument()
  })

  it('renders the children inside the field, not the frame', () => {
    const { container } = render(
      <EngravedPlate>
        <span>Knurl</span>
      </EngravedPlate>,
    )

    const frame = container.firstChild as HTMLElement
    const field = frame.firstChild as HTMLElement

    expect(frame).toHaveClass('surface-metal')
    expect(frame).not.toHaveClass('surface-field')
    expect(field).toHaveClass('surface-field')
    expect(field).toContainElement(screen.getByText('Knurl'))
  })
})
