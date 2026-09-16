import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Well } from './Well'

describe('Well', () => {
  it('renders its children', () => {
    render(
      <Well>
        <span>Widget</span>
      </Well>,
    )

    expect(screen.getByText('Widget')).toBeInTheDocument()
  })

  it('applies the well recipe', () => {
    const { container } = render(
      <Well>
        <span>Widget</span>
      </Well>,
    )

    expect(container.firstChild).toHaveClass('surface-well')
  })
})
