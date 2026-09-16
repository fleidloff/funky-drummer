import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Pad } from './Pad'

const label = 'Widget'
const pad = () => screen.getByRole('button', { name: label })

describe('Pad', () => {
  it('reports its lit state as a pressed button', () => {
    const { rerender } = render(<Pad label={label} lit onToggle={vi.fn()} />)

    expect(pad()).toHaveAttribute('aria-pressed', 'true')

    rerender(<Pad label={label} lit={false} onToggle={vi.fn()} />)

    expect(pad()).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls its handler once per press', () => {
    const onToggle = vi.fn()
    render(<Pad label={label} lit onToggle={onToggle} />)

    fireEvent.click(pad())

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('glows when it is lit and is dark when it is not', () => {
    const { rerender } = render(<Pad label={label} lit onToggle={vi.fn()} />)

    expect(pad().className.split(' ')).toContain('lamp-amber')

    rerender(<Pad label={label} lit={false} onToggle={vi.fn()} />)

    expect(pad().className.split(' ')).toContain('lamp-amber-off')
  })
})
