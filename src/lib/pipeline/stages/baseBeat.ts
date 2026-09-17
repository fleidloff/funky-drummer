import type { GridNote, Lane, Level } from '@/lib/groove/types'
import { LANES } from '@/lib/groove/types'
import type { Articulation } from '@/lib/kit/voices'
import { voiceOf } from '@/lib/kit/voices'
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

const MIX_PRIME = 0x9e3779b1

function mix32(value: number): number {
  let hash = Math.imul(value, MIX_PRIME)
  hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b)
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35)
  return hash ^ (hash >>> 16)
}

export function variantFor(
  seed: number,
  barIndex: number,
  step: number,
  lane: Lane,
): number {
  let hash = mix32(seed)
  hash = mix32(hash ^ barIndex)
  hash = mix32(hash ^ step)
  hash = mix32(hash ^ LANES.indexOf(lane))
  return hash >>> 0
}

function noteOf(source: GridNote): Note {
  const articulation = articulationOf(source)
  return {
    step: source.step,
    lane: source.lane,
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
