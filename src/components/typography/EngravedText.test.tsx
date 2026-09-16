import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EngravedText } from './EngravedText'

describe('EngravedText', () => {
  it('renders its children', () => {
    render(<EngravedText size="title">Knurl</EngravedText>)

    expect(screen.getByText('Knurl')).toBeInTheDocument()
  })

  it('gives title and caption a different class', () => {
    const { container: a } = render(<EngravedText size="title">Knurl</EngravedText>)
    const { container: b } = render(<EngravedText size="caption">Gubbins</EngravedText>)

    expect(a.firstElementChild?.className).not.toEqual(b.firstElementChild?.className)
  })

  it('rejects a stray size', () => {
    // @ts-expect-error a stray string is not a valid size
    render(<EngravedText size="huge">Knurl</EngravedText>)
  })
})
