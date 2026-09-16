'use client'

import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { dragValue } from './dragValue'

export type ContinuousProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  valueLabel: string
  scaleStart: string
  scaleEnd: string
  onChange: (value: number) => void
}

export type Axis = 'vertical' | 'horizontal'

const travelPx = 160
const keySteps: Record<string, number> = {
  ArrowUp: 1,
  ArrowRight: 1,
  ArrowDown: -1,
  ArrowLeft: -1,
  PageUp: 10,
  PageDown: -10,
}

export function useContinuous(
  { label, value, min, max, step, valueLabel, onChange }: ContinuousProps,
  axis: Axis,
) {
  const endDrag = useRef(() => {})

  useEffect(() => () => endDrag.current(), [])

  const settle = (target: number) =>
    onChange(dragValue({ start: target, deltaPx: 0, min, max, step, travelPx }))

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const steps = keySteps[event.key]

    if (event.key === 'Home') settle(min)
    else if (event.key === 'End') settle(max)
    else if (steps !== undefined) settle(value + steps * step)
    else return

    event.preventDefault()
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId)

    const origin = axis === 'vertical' ? event.clientY : event.clientX
    const start = value
    const travelled = (moved: PointerEvent) =>
      axis === 'vertical' ? origin - moved.clientY : moved.clientX - origin

    const onMove = (moved: PointerEvent) =>
      onChange(dragValue({ start, deltaPx: travelled(moved), min, max, step, travelPx }))

    const onRelease = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onRelease)
      window.removeEventListener('pointercancel', onRelease)
    }

    endDrag.current()
    endDrag.current = onRelease
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onRelease)
    window.addEventListener('pointercancel', onRelease)
  }

  return {
    ratio: max > min ? (value - min) / (max - min) : 0,
    slider: {
      role: 'slider' as const,
      tabIndex: 0,
      'aria-label': label,
      'aria-valuenow': value,
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuetext': valueLabel,
      onKeyDown,
      onPointerDown,
    },
  }
}
