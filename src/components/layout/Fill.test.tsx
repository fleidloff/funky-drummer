import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Fill } from './Fill'

describe('Fill', () => {
  it('renders its children', () => {
    render(<Fill>Knurl</Fill>)

    expect(screen.getByText('Knurl')).toBeInTheDocument()
  })

  it('takes the free space of the row it sits in without forcing it wider', () => {
    render(<Fill>Gubbins</Fill>)

    expect(screen.getByText('Gubbins')).toHaveClass('grow', 'min-w-0', 'flex')
  })
})
