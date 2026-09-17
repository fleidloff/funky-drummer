import { BEATS_PER_BAR, secondsPerBeat } from '@/lib/time/grid'
import type { Stage } from '../types'

export const globalTime: Stage = (bar, ctx) => ({
  ...bar,
  time: {
    startTime:
      ctx.startTime +
      (bar.index * BEATS_PER_BAR - ctx.startBeat) * secondsPerBeat(ctx.tempo),
    secondsPerBeat: secondsPerBeat(ctx.tempo),
  },
})
