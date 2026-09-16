import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Fader } from './Fader'

const fader = {
  label: 'Widget',
  value: 50,
  min: 0,
  max: 100,
  step: 1,
  valueLabel: '50 Gubbins',
  scaleStart: 'zero',
  scaleEnd: 'full',
}

describe('Fader', () => {
  it('is a slider carrying its range and its formatted value', () => {
    render(<Fader {...fader} onChange={vi.fn()} />)

    const slider = screen.getByRole('slider', { name: fader.label })

    expect(slider).toHaveAttribute('aria-valuenow', '50')
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '100')
    expect(slider).toHaveAttribute('aria-valuetext', fader.valueLabel)
    expect(slider).toHaveAttribute('tabindex', '0')
  })

  it('renders the two ends of its scale and its readout', () => {
    render(<Fader {...fader} onChange={vi.fn()} />)

    expect(screen.getByText(fader.scaleStart)).toBeInTheDocument()
    expect(screen.getByText(fader.scaleEnd)).toBeInTheDocument()
    expect(screen.getByText(fader.valueLabel)).toBeInTheDocument()
  })

  it('moves one step on an arrow key', () => {
    const onChange = vi.fn()
    render(<Fader {...fader} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: fader.label })

    fireEvent.keyDown(slider, { key: 'ArrowUp' })
    fireEvent.keyDown(slider, { key: 'ArrowDown' })

    expect(onChange.mock.calls).toEqual([[51], [49]])
  })

  it('moves ten steps on a page key', () => {
    const onChange = vi.fn()
    render(<Fader {...fader} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: fader.label })

    fireEvent.keyDown(slider, { key: 'PageUp' })
    fireEvent.keyDown(slider, { key: 'PageDown' })

    expect(onChange.mock.calls).toEqual([[60], [40]])
  })

  it('jumps to either end on Home and End', () => {
    const onChange = vi.fn()
    render(<Fader {...fader} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: fader.label })

    fireEvent.keyDown(slider, { key: 'Home' })
    fireEvent.keyDown(slider, { key: 'End' })

    expect(onChange.mock.calls).toEqual([[fader.min], [fader.max]])
  })

  it('goes no further than its bounds on a key', () => {
    const onChange = vi.fn()
    const { rerender } = render(<Fader {...fader} value={fader.max} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: fader.label })

    fireEvent.keyDown(slider, { key: 'ArrowUp' })
    rerender(<Fader {...fader} value={fader.min} onChange={onChange} />)
    fireEvent.keyDown(slider, { key: 'ArrowDown' })

    expect(onChange.mock.calls).toEqual([[fader.max], [fader.min]])
  })

  it('counts up over the same travel as the knob, along its own axis', () => {
    const onChange = vi.fn()
    render(<Fader {...fader} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: fader.label })

    fireEvent.pointerDown(slider, { clientX: 200, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 216, pointerId: 1 })

    expect(onChange).toHaveBeenLastCalledWith(60)
  })

  it('counts down as the pointer is dragged back along the track', () => {
    const onChange = vi.fn()
    render(<Fader {...fader} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: fader.label })

    fireEvent.pointerDown(slider, { clientX: 200, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 168, pointerId: 1 })

    expect(onChange).toHaveBeenLastCalledWith(30)
  })

  it('lets go of the pointer when the drag ends', () => {
    const onChange = vi.fn()
    render(<Fader {...fader} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: fader.label })

    fireEvent.pointerDown(slider, { clientX: 200, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 216, pointerId: 1 })
    fireEvent.pointerUp(window, { pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 300, pointerId: 1 })

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('slides its thumb along the track as the value rises', () => {
    const { rerender } = render(<Fader {...fader} value={fader.min} onChange={vi.fn()} />)
    const thumb = () =>
      screen.getByRole('slider', { name: fader.label }).querySelector('[data-part="thumb"]')

    expect(thumb()?.getAttribute('style')).toContain('left: 0%')

    rerender(<Fader {...fader} value={fader.max} onChange={vi.fn()} />)

    expect(thumb()?.getAttribute('style')).toContain('left: 100%')
  })
})
