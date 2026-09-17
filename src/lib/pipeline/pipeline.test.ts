import { describe, expect, it } from 'vitest'
import type {
  Bar as GridBar,
  GridNote,
  Groove,
  Lane,
  Level,
} from '@/lib/groove/types'
import { BEATS_PER_BAR, barSeconds, secondsPerBeat } from '@/lib/time/grid'
import type { Bar, BarContext, Note, Stage } from './index'
import { CLAMP_BEATS, PIPELINE, runBar } from './index'
import { globalTime } from './stages/globalTime'

const gridNote = (step: number, lane: Lane, level: Level): GridNote => ({
  step,
  lane,
  level,
})

const FIRST_BAR: GridBar = [
  gridNote(0, 'kick', 'anchor'),
  gridNote(2, 'hihat', 'normal'),
  gridNote(4, 'snare', 'accent'),
  gridNote(6, 'hihat', 'ghost'),
]

const SECOND_BAR: GridBar = [
  gridNote(0, 'cowbell', 'normal'),
  gridNote(4, 'tom1', 'accent'),
]

const FIXTURE: Groove = {
  id: 'fixture',
  name: 'Fixture',
  tempo: 96,
  swing: 50,
  bars: [FIRST_BAR, SECOND_BAR],
}

const contextOf = (overrides: Partial<BarContext> = {}): BarContext => ({
  groove: FIXTURE,
  tempo: 96,
  swingPercent: 50,
  feel: 0,
  seed: 7,
  startTime: 0,
  startBeat: 0,
  ...overrides,
})

const barOf = (index: number, notes: readonly Note[] = []): Bar => ({
  index,
  time: null,
  notes,
})

const startOf = (bar: Bar): number | undefined => bar.time?.startTime

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  for (const inner of Object.values(value)) deepFreeze(inner)
  return Object.freeze(value)
}

describe('the seam a later stage drops into', () => {
  const MARKER: Note = {
    step: 11,
    lane: 'crash',
    level: 'accent',
    voice: 'crash',
    articulation: 'crash.hit',
    velocity: 0.42,
    offsetBeats: 0.125,
  }
  const PROBE_SHIFT = 1
  const INDEX = 6

  const insertionPoints: readonly number[] = Array.from(
    [...PIPELINE, null].keys(),
  )

  type Sighting = { readonly bar: Bar; readonly ctx: BarContext; out: Bar }

  const probeInto = (sightings: Sighting[]): Stage => {
    return (bar, ctx) => {
      const out: Bar = {
        ...bar,
        index: bar.index + PROBE_SHIFT,
        notes: [...bar.notes, MARKER],
      }
      sightings.push({ bar, ctx, out })
      return out
    }
  }

  const splice = (at: number, stage: Stage): readonly Stage[] => {
    const stages = [...PIPELINE]
    stages.splice(at, 0, stage)
    return stages
  }

  const run = (at: number, ctx: BarContext) => {
    const sightings: Sighting[] = []
    const final = runBar(splice(at, probeInto(sightings)), INDEX, ctx)
    return { sightings, final }
  }

  it('offers more than one place to splice a stage in', () => {
    expect(insertionPoints.length).toBeGreaterThan(1)
  })

  it.each(insertionPoints)('runs a stage spliced in at %i once', (at) => {
    const { sightings } = run(at, contextOf())
    expect(sightings).toHaveLength(1)
  })

  it.each(insertionPoints)(
    'hands a stage spliced in at %i what the stages before it produced',
    (at) => {
      const ctx = contextOf()
      const { sightings } = run(at, ctx)
      expect(sightings[0].bar).toEqual(runBar([...PIPELINE].slice(0, at), INDEX, ctx))
    },
  )

  it.each(insertionPoints)(
    'hands a stage spliced in at %i the caller’s own context object',
    (at) => {
      const ctx = contextOf()
      const { sightings } = run(at, ctx)
      expect(sightings[0].ctx).toBe(ctx)
    },
  )

  it.each(insertionPoints)(
    'carries the bar a stage spliced in at %i returned, marker note and all, through every stage after it',
    (at) => {
      const ctx = contextOf()
      const { sightings, final } = run(at, ctx)
      const after = [...PIPELINE].slice(at)
      const folded = after.reduce<Bar>(
        (bar, stage) => stage(bar, ctx),
        sightings[0].out,
      )
      expect(sightings[0].out.notes).toContainEqual(MARKER)
      expect(final).toEqual(folded)
    },
  )

  it.each(insertionPoints)(
    'lets a stage spliced in at %i change a field of the bar that comes out',
    (at) => {
      const ctx = contextOf()
      const { final } = run(at, ctx)
      expect(final.index).toBe(INDEX + PROBE_SHIFT)
      expect(final).not.toEqual(runBar(PIPELINE, INDEX, ctx))
    },
  )

  it('leaves the pipeline itself as it found it', () => {
    const before = [...PIPELINE]
    for (const at of insertionPoints) run(at, contextOf())
    runBar(PIPELINE, INDEX, contextOf())
    expect([...PIPELINE]).toEqual(before)
  })
})

describe('runBar', () => {
  const seedOf = (index: number, ctx: BarContext): Bar => {
    const seen: Bar[] = []
    runBar(
      [
        (bar) => {
          seen.push(bar)
          return bar
        },
      ],
      index,
      ctx,
    )
    return seen[0]
  }

  it('seeds an empty bar at the index it was given', () => {
    expect(seedOf(4, contextOf())).toEqual({ index: 4, time: null, notes: [] })
  })

  it('returns a bar carrying the index it was given', () => {
    expect(runBar(PIPELINE, 12, contextOf()).index).toBe(12)
  })

  it('returns the seed bar for an empty stage list', () => {
    expect(runBar([], 3, contextOf())).toEqual({
      index: 3,
      time: null,
      notes: [],
    })
  })

  it('returns a bar that is not the seed once a stage has built one', () => {
    const ctx = contextOf()
    const final = runBar(PIPELINE, 2, ctx)
    expect(final).not.toBe(seedOf(2, ctx))
    expect(final).not.toEqual(seedOf(2, ctx))
  })

  it('mutates neither the context nor the stage list it was handed', () => {
    const ctx = contextOf()
    const ctxBefore = structuredClone(ctx)
    const stages = [...PIPELINE]
    const stagesBefore = [...stages]

    runBar(stages, 5, ctx)

    expect(ctx).toEqual(ctxBefore)
    expect(stages).toEqual(stagesBefore)
  })

  it('touches nothing on a deep-frozen context', () => {
    const ctx = deepFreeze(contextOf({ startTime: 3.5, startBeat: 8 }))
    expect(() => runBar(PIPELINE, 9, ctx)).not.toThrow()
    expect(runBar(PIPELINE, 9, ctx).time).not.toBeNull()
  })
})

describe('globalTime', () => {
  it('puts the bar the tempo took effect on at the context start time', () => {
    const ctx = contextOf({ startTime: 4.25, startBeat: 12 })
    expect(startOf(globalTime(barOf(3), ctx))).toBe(4.25)
  })

  it('is the start time plus whole beats from the anchor beat', () => {
    const ctx = contextOf({ tempo: 96, startTime: 1.75, startBeat: 16 })
    for (const index of [4, 5, 6, 7, 12, 64, 1009]) {
      expect(startOf(globalTime(barOf(index), ctx))).toBe(
        1.75 + (index - 4) * barSeconds(96),
      )
    }
  })


  it('anchors on a beat inside a bar, so a tempo change need not wait for a bar line', () => {
    const spb = secondsPerBeat(120)
    const ctx = contextOf({ tempo: 120, startTime: 10, startBeat: 6 })

    expect(startOf(globalTime(barOf(1), ctx))).toBe(10 - 2 * spb)
    expect(startOf(globalTime(barOf(2), ctx))).toBe(10 + 2 * spb)
  })

  it('reads the seconds per beat off the context tempo', () => {
    for (const tempo of [60, 96, 110, 120, 180]) {
      const bar = globalTime(barOf(5), contextOf({ tempo }))
      expect(bar.time?.secondsPerBeat).toBe(secondsPerBeat(tempo))
    }
  })

  it('leaves the notes and the index alone', () => {
    const notes: readonly Note[] = [
      {
        step: 4,
        lane: 'snare',
        level: 'anchor',
        voice: 'snare',
        articulation: 'snare.backbeat',
        velocity: 1,
        offsetBeats: 0,
      },
    ]
    const bar = globalTime(barOf(2, notes), contextOf())
    expect(bar.notes).toBe(notes)
    expect(bar.index).toBe(2)
  })

  it('mutates neither the bar nor the context', () => {
    const ctx = contextOf({ startTime: 2, startBeat: 4 })
    const ctxBefore = structuredClone(ctx)
    const bar = barOf(7)
    const barBefore = structuredClone(bar)

    globalTime(bar, ctx)

    expect(ctx).toEqual(ctxBefore)
    expect(bar).toEqual(barBefore)
  })
})

describe('time is computed, never accumulated', () => {
  const TEMPO = 110
  const BARS = 1000
  const ctx = contextOf({ tempo: TEMPO, startTime: 0.5, startBeat: 0 })

  it('reaches the thousandth bar line in one multiplication', () => {
    let accumulated = ctx.startTime
    for (let index = 0; index < BARS - 1; index += 1) {
      accumulated += barSeconds(TEMPO)
    }

    expect(startOf(globalTime(barOf(BARS - 1), ctx))).toBe(
      ctx.startTime + (BARS - 1) * barSeconds(TEMPO),
    )
    expect(startOf(globalTime(barOf(0), ctx))).toBe(ctx.startTime)
    expect(accumulated).not.toBe(ctx.startTime + (BARS - 1) * barSeconds(TEMPO))
  })

  it('gives the same bar line whether a thousand bars ran before it or none', () => {
    let last: Bar | null = null
    for (let index = 0; index < BARS; index += 1) last = runBar(PIPELINE, index, ctx)

    expect(last?.time).toEqual(runBar(PIPELINE, BARS - 1, ctx).time)
    expect(startOf(runBar(PIPELINE, BARS - 1, ctx))).toBe(
      ctx.startTime + (BARS - 1) * barSeconds(TEMPO),
    )
  })
})

describe('a tempo change takes effect at the next bar line', () => {
  const CHANGE_AT = 8
  const OLD_TEMPO = 96
  const NEW_TEMPO = 120

  const before = contextOf({
    tempo: OLD_TEMPO,
    startTime: 2,
    startBeat: 0,
  })
  const after = contextOf({
    tempo: NEW_TEMPO,
    startTime: 2 + CHANGE_AT * barSeconds(OLD_TEMPO),
    startBeat: CHANGE_AT * BEATS_PER_BAR,
  })

  it('starts the new tempo on the bar line the old one would have reached', () => {
    expect(startOf(globalTime(barOf(CHANGE_AT), after))).toBe(
      2 + CHANGE_AT * barSeconds(OLD_TEMPO),
    )
    expect(startOf(globalTime(barOf(CHANGE_AT), after))).toBe(
      startOf(globalTime(barOf(CHANGE_AT), before)),
    )
  })

  it('moves no bar line already computed under the old tempo', () => {
    for (let index = 0; index < CHANGE_AT; index += 1) {
      expect(startOf(globalTime(barOf(index), before))).toBe(
        2 + index * barSeconds(OLD_TEMPO),
      )
    }
  })

  it('moves every bar line after the change', () => {
    for (const index of [CHANGE_AT + 1, CHANGE_AT + 2, CHANGE_AT + 40]) {
      expect(startOf(globalTime(barOf(index), after))).toBe(
        after.startTime + (index - CHANGE_AT) * barSeconds(NEW_TEMPO),
      )
      expect(startOf(globalTime(barOf(index), after))).not.toBe(
        startOf(globalTime(barOf(index), before)),
      )
    }
  })

  it('plays the bars after the change at the new seconds per beat', () => {
    expect(globalTime(barOf(CHANGE_AT), after).time?.secondsPerBeat).toBe(
      secondsPerBeat(NEW_TEMPO),
    )
    expect(globalTime(barOf(CHANGE_AT - 1), before).time?.secondsPerBeat).toBe(
      secondsPerBeat(OLD_TEMPO),
    )
  })
})

describe('the whole pipeline', () => {
  const ctx = contextOf({ tempo: 96, startTime: 1, startBeat: 0 })

  it('gives a bar a time', () => {
    expect(runBar(PIPELINE, 0, ctx).time).toEqual({
      startTime: 1,
      secondsPerBeat: secondsPerBeat(96),
    })
  })

  it('plays every hit of the groove bar the index calls for', () => {
    const played = (index: number) =>
      runBar(PIPELINE, index, ctx).notes.map((note) => [note.step, note.lane])
    const written = (bar: GridBar) => bar.map((note) => [note.step, note.lane])

    expect(played(0)).toEqual(expect.arrayContaining(written(FIRST_BAR)))
    expect(played(1)).toEqual(expect.arrayContaining(written(SECOND_BAR)))
  })

  it('gives every note a velocity and an offset', () => {
    const notes = runBar(PIPELINE, 0, ctx).notes
    expect(notes.length).toBeGreaterThan(0)
    for (const note of notes) {
      expect(note.velocity).toBeGreaterThan(0)
      expect(note.velocity).toBeLessThanOrEqual(1)
      expect(Number.isFinite(note.offsetBeats)).toBe(true)
    }
  })

  it('displaces notes off the grid, inside the clamp', () => {
    const offsets = []
    for (let index = 0; index < 32; index += 1) {
      for (const note of runBar(PIPELINE, index, ctx).notes) {
        offsets.push(note.offsetBeats)
      }
    }

    expect(offsets.length).toBeGreaterThan(0)
    expect(offsets.some((offset) => offset !== 0)).toBe(true)
    expect(offsets.some((offset) => offset > 0)).toBe(true)
    expect(offsets.some((offset) => offset < 0)).toBe(true)
    for (const offset of offsets) {
      expect(Math.abs(offset)).toBeLessThanOrEqual(CLAMP_BEATS)
    }
  })

  it('shapes velocity across the phrase and leaves the anchors alone', () => {
    const at = (index: number) =>
      new Map(runBar(PIPELINE, index, ctx).notes.map((n) => [n.step, n]))

    const early = at(0)
    const later = at(2)

    const anchors = [...early.values()].filter((n) => n.level === 'anchor')
    expect(anchors.length).toBeGreaterThan(0)
    for (const anchor of anchors) {
      expect(later.get(anchor.step)?.velocity).toBe(anchor.velocity)
    }

    const shaped = [...early.values()].filter(
      (n) => n.level !== 'anchor' && later.get(n.step)?.velocity !== n.velocity,
    )
    expect(shaped.length).toBeGreaterThan(0)
  })
})
