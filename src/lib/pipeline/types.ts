import type { Articulation, Voice } from '@/lib/kit/voices'
import type { Groove, Lane } from '@/lib/groove/types'

export type Note = {
  readonly step: number
  readonly lane: Lane
  readonly voice: Voice
  readonly articulation: Articulation
  readonly velocity: number
  readonly offsetBeats: number
}

export type BarTime = {
  readonly startTime: number
  readonly secondsPerBeat: number
}

export type Bar = {
  readonly index: number
  readonly time: BarTime | null
  readonly notes: readonly Note[]
}

export type BarContext = {
  readonly groove: Groove
  readonly tempo: number
  readonly swingPercent: number
  readonly feel: number
  readonly seed: number
  readonly startTime: number
  readonly startBeat: number
}

export type Stage = (bar: Bar, ctx: BarContext) => Bar
