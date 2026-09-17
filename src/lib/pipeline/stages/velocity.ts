import { STEPS_PER_BAR } from '@/lib/groove/types'
import type { Note, Stage } from '../types'

export const BAR_CURVE_MIN = 0.92
export const BAR_CURVE_MAX = 1.05
export const PHRASE_CURVE_MIN = 0.9
export const PHRASE_CURVE_MAX = 1.08
export const PHRASE_BARS = 4

const PHRASE_VALUES: readonly number[] = [
  PHRASE_CURVE_MIN,
  0.98,
  1.04,
  PHRASE_CURVE_MAX,
]

export function barCurve(step: number): number {
  return (
    BAR_CURVE_MIN +
    (BAR_CURVE_MAX - BAR_CURVE_MIN) * Math.sin((Math.PI * step) / STEPS_PER_BAR)
  )
}

export function phraseCurve(barIndex: number): number {
  return PHRASE_VALUES[((barIndex % PHRASE_BARS) + PHRASE_BARS) % PHRASE_BARS]
}

export function isExempt(note: Note): boolean {
  return note.level === 'anchor'
}

export const velocity: Stage = (bar) => ({
  ...bar,
  notes: bar.notes.map((note) =>
    isExempt(note)
      ? note
      : {
          ...note,
          velocity: note.velocity * barCurve(note.step) * phraseCurve(bar.index),
        },
  ),
})
