import { STEPS_PER_BEAT } from './grid'

const STEPS_PER_PAIR = 2

export function swungStepBeats(step: number, swingPercent: number): number {
  const pairBeats = STEPS_PER_PAIR / STEPS_PER_BEAT
  const pairLine = Math.floor(step / STEPS_PER_PAIR) * pairBeats

  if (step % STEPS_PER_PAIR === 0) return pairLine

  return pairLine + pairBeats * (swingPercent / 100)
}
