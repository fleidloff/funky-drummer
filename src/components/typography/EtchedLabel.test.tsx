import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EtchedLabel } from './EtchedLabel'

describe('EtchedLabel', () => {
  it('renders its children', () => {
    render(<EtchedLabel size="control">Knurl</EtchedLabel>)

    expect(screen.getByText('Knurl')).toBeInTheDocument()
  })

  it('gives control and scale a different class', () => {
    const { container: a } = render(<EtchedLabel size="control">Knurl</EtchedLabel>)
    const { container: b } = render(<EtchedLabel size="scale">Gubbins</EtchedLabel>)

    expect(a.firstElementChild?.className).not.toEqual(b.firstElementChild?.className)
  })

  it('rejects a stray size', () => {
    // @ts-expect-error a stray string is not a valid size
    render(<EtchedLabel size="huge">Knurl</EtchedLabel>)
  })
})
