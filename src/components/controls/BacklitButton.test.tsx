import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BacklitButton } from './BacklitButton'

const label = 'Gubbins'
const classesOf = (name: string) => screen.getByRole('button', { name }).className.split(' ')

describe('BacklitButton', () => {
  it('reports its lit state as a pressed button', () => {
    const { rerender } = render(
      <BacklitButton label={label} tone="green" lit onToggle={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'true')

    rerender(<BacklitButton label={label} tone="green" lit={false} onToggle={vi.fn()} />)

    expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls its handler once per press', () => {
    const onToggle = vi.fn()
    render(<BacklitButton label={label} tone="amber" lit={false} onToggle={onToggle} />)

    fireEvent.click(screen.getByRole('button', { name: label }))

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('takes the lamp its tone names', () => {
    const { rerender } = render(
      <BacklitButton label={label} tone="amber" lit onToggle={vi.fn()} />,
    )

    expect(classesOf(label)).toContain('lamp-amber')

    rerender(<BacklitButton label={label} tone="amber" lit={false} onToggle={vi.fn()} />)

    expect(classesOf(label)).toContain('lamp-amber-off')

    rerender(<BacklitButton label={label} tone="green" lit onToggle={vi.fn()} />)

    expect(classesOf(label)).toContain('lamp-green')
  })

  it('pulses only while it is lit', () => {
    const pulse = 'lamp-pulsing'
    const { rerender } = render(
      <BacklitButton label={label} tone="green" lit pulsing onToggle={vi.fn()} />,
    )

    expect(classesOf(label)).toContain(pulse)

    rerender(<BacklitButton label={label} tone="green" lit={false} pulsing onToggle={vi.fn()} />)

    expect(classesOf(label)).not.toContain(pulse)

    rerender(<BacklitButton label={label} tone="green" lit onToggle={vi.fn()} />)

    expect(classesOf(label)).not.toContain(pulse)
  })
})

describe('a lamp that stays on while the latch moves', () => {
  it('reports the latch rather than the lamp when the two are told apart', () => {
    render(
      <BacklitButton label="Knurl" tone="green" lit pressed={false} onToggle={vi.fn()} />,
    )

    const button = screen.getByRole('button', { name: 'Knurl' })

    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(button).toHaveClass('lamp-green')
  })

  it('falls back to the lamp when no latch is given', () => {
    render(<BacklitButton label="Gubbins" tone="amber" lit onToggle={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Gubbins' })).toHaveAttribute('aria-pressed', 'true')
  })
})
