import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Knob } from './Knob'

const knob = {
  label: 'Knurl',
  value: 50,
  min: 0,
  max: 100,
  step: 1,
  valueLabel: '50 Gubbins',
  scaleStart: 'zero',
  scaleEnd: 'full',
}

describe('Knob', () => {
  it('is a slider carrying its range and its formatted value', () => {
    render(<Knob {...knob} onChange={vi.fn()} />)

    const slider = screen.getByRole('slider', { name: knob.label })

    expect(slider).toHaveAttribute('aria-valuenow', '50')
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '100')
    expect(slider).toHaveAttribute('aria-valuetext', knob.valueLabel)
    expect(slider).toHaveAttribute('tabindex', '0')
  })

  it('renders the two ends of its scale and its readout', () => {
    render(<Knob {...knob} onChange={vi.fn()} />)

    expect(screen.getByText(knob.scaleStart)).toBeInTheDocument()
    expect(screen.getByText(knob.scaleEnd)).toBeInTheDocument()
    expect(screen.getByText(knob.valueLabel)).toBeInTheDocument()
  })

  it('moves one step on an arrow key', () => {
    const onChange = vi.fn()
    render(<Knob {...knob} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: knob.label })

    fireEvent.keyDown(slider, { key: 'ArrowUp' })
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    fireEvent.keyDown(slider, { key: 'ArrowDown' })
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })

    expect(onChange.mock.calls).toEqual([[51], [51], [49], [49]])
  })

  it('moves ten steps on a page key', () => {
    const onChange = vi.fn()
    render(<Knob {...knob} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: knob.label })

    fireEvent.keyDown(slider, { key: 'PageUp' })
    fireEvent.keyDown(slider, { key: 'PageDown' })

    expect(onChange.mock.calls).toEqual([[60], [40]])
  })

  it('jumps to either end on Home and End', () => {
    const onChange = vi.fn()
    render(<Knob {...knob} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: knob.label })

    fireEvent.keyDown(slider, { key: 'Home' })
    fireEvent.keyDown(slider, { key: 'End' })

    expect(onChange.mock.calls).toEqual([[knob.min], [knob.max]])
  })

  it('goes no further than its bounds on a key', () => {
    const onChange = vi.fn()
    const { rerender } = render(<Knob {...knob} value={knob.max} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: knob.label })

    fireEvent.keyDown(slider, { key: 'ArrowUp' })
    rerender(<Knob {...knob} value={knob.min} onChange={onChange} />)
    fireEvent.keyDown(slider, { key: 'ArrowDown' })

    expect(onChange.mock.calls).toEqual([[knob.max], [knob.min]])
  })

  it('ignores a key it does not drive', () => {
    const onChange = vi.fn()
    render(<Knob {...knob} onChange={onChange} />)

    fireEvent.keyDown(screen.getByRole('slider', { name: knob.label }), { key: 'a' })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('counts up as the pointer is dragged upward', () => {
    const onChange = vi.fn()
    render(<Knob {...knob} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: knob.label })

    fireEvent.pointerDown(slider, { clientY: 200, pointerId: 1 })
    fireEvent.pointerMove(window, { clientY: 184, pointerId: 1 })

    expect(onChange).toHaveBeenLastCalledWith(60)
  })

  it('counts down as the pointer is dragged downward', () => {
    const onChange = vi.fn()
    render(<Knob {...knob} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: knob.label })

    fireEvent.pointerDown(slider, { clientY: 200, pointerId: 1 })
    fireEvent.pointerMove(window, { clientY: 232, pointerId: 1 })

    expect(onChange).toHaveBeenLastCalledWith(30)
  })

  it('lets go of the pointer when the drag ends', () => {
    const onChange = vi.fn()
    render(<Knob {...knob} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: knob.label })

    fireEvent.pointerDown(slider, { clientY: 200, pointerId: 1 })
    fireEvent.pointerMove(window, { clientY: 184, pointerId: 1 })
    fireEvent.pointerUp(window, { pointerId: 1 })
    fireEvent.pointerMove(window, { clientY: 100, pointerId: 1 })

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('turns its needle over the sweep of the scale', () => {
    const { rerender } = render(<Knob {...knob} value={knob.min} onChange={vi.fn()} />)
    const needle = () =>
      screen
        .getByRole('slider', { name: knob.label })
        .querySelector('[data-part="needle"]')
        ?.getAttribute('transform')

    expect(needle()).toBe('rotate(-135 50 50)')

    rerender(<Knob {...knob} value={knob.max} onChange={vi.fn()} />)

    expect(needle()).toBe('rotate(135 50 50)')
  })
})
