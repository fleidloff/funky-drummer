import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Readout } from './Readout'

describe('Readout', () => {
  it('renders its children', () => {
    render(<Readout>54%</Readout>)

    expect(screen.getByText('54%')).toBeInTheDocument()
  })
})
