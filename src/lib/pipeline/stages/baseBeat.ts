import type { GridNote, Lane, Level } from '@/lib/groove/types'
import { LANES } from '@/lib/groove/types'
import type { Articulation } from '@/lib/kit/voices'
import { voiceOf } from '@/lib/kit/voices'
import { hashOf } from '@/lib/random/hash'
import type { Bar, BarContext, Note, Stage } from '../types'

const VELOCITY: Record<Level, number> = {
  anchor: 1,
  accent: 0.85,
  normal: 0.65,
  ghost: 0.3,
}

const atEveryLevel = (
  articulation: Articulation,
): Record<Level, Articulation> => ({
  anchor: articulation,
  accent: articulation,
  normal: articulation,
  ghost: articulation,
})

const ARTICULATION: Record<Lane, Record<Level, Articulation>> = {
  kick: {
    anchor: 'kick.hard',
    accent: 'kick.hard',
    normal: 'kick.soft',
    ghost: 'kick.soft',
  },
  snare: {
    anchor: 'snare.backbeat',
    accent: 'snare.backbeat',
    normal: 'snare.normal',
    ghost: 'snare.ghost',
  },
  hihat: {
    anchor: 'hihat.accent',
    accent: 'hihat.accent',
    normal: 'hihat.closed',
    ghost: 'hihat.closed',
  },
  ride: atEveryLevel('ride.bow'),
  cowbell: atEveryLevel('cowbell.hit'),
  shaker: atEveryLevel('shaker.hit'),
  tom1: atEveryLevel('toms.rack'),
  tom2: atEveryLevel('toms.floor'),
  crash: atEveryLevel('crash.hit'),
}

function articulationOf(note: GridNote): Articulation {
  if (note.open) return 'hihat.open'
  if (note.bell) return 'ride.bell'
  return ARTICULATION[note.lane][note.level]
}

export function variantFor(
  seed: number,
  barIndex: number,
  step: number,
  lane: Lane,
): number {
  return hashOf(seed, barIndex, step, LANES.indexOf(lane))
}

function noteOf(source: GridNote): Note {
  const articulation = articulationOf(source)
  return {
    step: source.step,
    lane: source.lane,
    level: source.level,
    voice: voiceOf(articulation),
    articulation,
    velocity: VELOCITY[source.level],
    offsetBeats: 0,
  }
}

export const baseBeat: Stage = (bar: Bar, ctx: BarContext): Bar => {
  const bars = ctx.groove.bars
  const grid = bars[bar.index % bars.length]
  return { ...bar, notes: grid.map(noteOf) }
}
