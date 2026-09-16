import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MomentaryButton } from './MomentaryButton'

const label = 'Knurl'
const button = () => screen.getByRole('button', { name: label })
const classesOf = () => button().className.split(' ')

describe('MomentaryButton', () => {
  it('latches no state', () => {
    render(<MomentaryButton label={label} tone="steel" onPress={vi.fn()} />)

    expect(button()).not.toHaveAttribute('aria-pressed')
  })

  it('calls its handler on the way down', () => {
    const onPress = vi.fn()
    render(<MomentaryButton label={label} tone="steel" onPress={onPress} />)

    fireEvent.pointerDown(button(), { pointerId: 1 })

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('lights while the finger is down and goes dark on release', () => {
    render(<MomentaryButton label={label} tone="amber" onPress={vi.fn()} />)

    expect(classesOf()).toContain('lamp-amber-off')

    fireEvent.pointerDown(button(), { pointerId: 1 })

    expect(classesOf()).toContain('lamp-amber')

    fireEvent.pointerUp(button(), { pointerId: 1 })

    expect(classesOf()).toContain('lamp-amber-off')
  })

  it('goes dark when the pointer leaves it', () => {
    render(<MomentaryButton label={label} tone="amber" onPress={vi.fn()} />)

    fireEvent.pointerDown(button(), { pointerId: 1 })
    fireEvent.pointerLeave(button(), { pointerId: 1 })

    expect(classesOf()).toContain('lamp-amber-off')
  })

  it('lights while a key is held and goes dark when it is let go', () => {
    const onPress = vi.fn()
    render(<MomentaryButton label={label} tone="amber" onPress={onPress} />)

    fireEvent.keyDown(button(), { key: ' ' })

    expect(classesOf()).toContain('lamp-amber')

    fireEvent.keyUp(button(), { key: ' ' })

    expect(classesOf()).toContain('lamp-amber-off')
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('ignores the repeats of a held key', () => {
    const onPress = vi.fn()
    render(<MomentaryButton label={label} tone="amber" onPress={onPress} />)

    fireEvent.keyDown(button(), { key: 'Enter' })
    fireEvent.keyDown(button(), { key: 'Enter', repeat: true })

    expect(onPress).toHaveBeenCalledTimes(1)
  })
})

describe('the steel tone the panel actually uses', () => {
  it('lights by brightening its machined face, because steel carries no lamp', () => {
    render(<MomentaryButton label="Knurl" tone="steel" onPress={vi.fn()} />)

    const button = screen.getByRole('button', { name: 'Knurl' })

    expect(button).toHaveClass('button-steel')
    expect(button).not.toHaveClass('brightness-125')

    fireEvent.pointerDown(button)

    expect(button).toHaveClass('button-steel', 'brightness-125')

    fireEvent.pointerUp(button)

    expect(button).not.toHaveClass('brightness-125')
  })
})
