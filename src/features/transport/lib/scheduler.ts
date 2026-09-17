import type { Groove } from '@/lib/groove/types'
import type { Stage } from '@/lib/pipeline'
import { CLAMP_BEATS, PIPELINE, runBar, variantFor } from '@/lib/pipeline'
import {
  BEATS_PER_BAR,
  STEPS_PER_BEAT,
  STRAIGHT_PERCENT,
  noteTime,
  secondsPerBeat,
} from '@/lib/time/grid'
import type { Player } from './player'

export const LOOKAHEAD_SECONDS = 0.1
export const TICK_MS = 25

const FEEL = 0.5

export type Clock = () => number

export type SchedulerDeps = {
  readonly clock: Clock
  readonly play: Player['play']
  readonly stages?: readonly Stage[]
}

export type Scheduler = {
  start: (startTime: number, tempo: number, seed: number) => void
  stop: () => void
  tick: () => void
  setTempo: (tempo: number) => void
}

export function createScheduler(
  groove: Groove,
  deps: SchedulerDeps,
): Scheduler {
  const stages = deps.stages ?? PIPELINE

  let running = false
  let tempo = 0
  let seed = 0
  let startTime = 0
  let startBeat = 0
  let nextBeat = 0

  const beatLine = (beat: number) =>
    startTime + (beat - startBeat) * secondsPerBeat(tempo)

  const planBeat = (beat: number) => {
    const index = Math.floor(beat / BEATS_PER_BAR)
    const firstStep = (beat - index * BEATS_PER_BAR) * STEPS_PER_BEAT

    const bar = runBar(stages, index, {
      groove,
      tempo,
      swingPercent: STRAIGHT_PERCENT,
      feel: FEEL,
      seed,
      startTime,
      startBeat,
    })
    const time = bar.time
    if (!time) return

    for (const note of bar.notes) {
      if (note.step < firstStep || note.step >= firstStep + STEPS_PER_BEAT) {
        continue
      }
      deps.play(
        note.articulation,
        note.velocity,
        noteTime(
          time.startTime,
          time.secondsPerBeat,
          note.step,
          note.offsetBeats,
          STRAIGHT_PERCENT,
        ),
        variantFor(seed, index, note.step, note.lane),
      )
    }
  }

  return {
    start: (at, bpm, performanceSeed) => {
      running = true
      startTime = at
      startBeat = 0
      tempo = bpm
      seed = performanceSeed
      nextBeat = 0
    },

    stop: () => {
      running = false
    },

    setTempo: (bpm) => {
      startTime = beatLine(nextBeat)
      startBeat = nextBeat
      tempo = bpm
    },

    tick: () => {
      if (!running) return
      const horizon =
        deps.clock() + LOOKAHEAD_SECONDS + CLAMP_BEATS * secondsPerBeat(tempo)
      while (beatLine(nextBeat) < horizon) {
        planBeat(nextBeat)
        nextBeat += 1
      }
    },
  }
}
