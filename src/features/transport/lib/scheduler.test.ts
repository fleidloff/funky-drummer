import { describe, expect, it } from 'vitest'
import type { Groove } from '@/lib/groove/types'
import type { Articulation } from '@/lib/kit/voices'
import type { Stage } from '@/lib/pipeline'
import { CLAMP_BEATS, PIPELINE } from '@/lib/pipeline'
import { STRAIGHT_PERCENT, secondsPerBeat } from '@/lib/time/grid'
import { LOOKAHEAD_SECONDS, TICK_MS, createScheduler } from './scheduler'

const FIXTURE: Groove = {
  id: 'fixture',
  name: 'Fixture',
  tempo: 96,
  swing: 50,
  bars: [
    [
      { step: 0, lane: 'kick', level: 'anchor' },
      { step: 4, lane: 'snare', level: 'accent' },
      { step: 6, lane: 'hihat', level: 'normal' },
      { step: 10, lane: 'kick', level: 'normal' },
      { step: 12, lane: 'snare', level: 'accent' },
    ],
  ],
}

const BEAT_HEAD_FIXTURE: Groove = {
  id: 'beat-heads',
  name: 'Beat heads',
  tempo: 96,
  swing: 50,
  bars: [
    [0, 4, 8, 12].map((step) => ({ step, lane: 'kick', level: 'anchor' }) as const),
  ],
}

const EVERY_STEP_FIXTURE: Groove = {
  id: 'every-step',
  name: 'Every step',
  tempo: 96,
  swing: 50,
  bars: [
    Array.from({ length: 16 }, (_, step) => ({ step, lane: 'hihat', level: 'normal' }) as const),
  ],
}

const STEPS = FIXTURE.bars[0].map((note) => note.step)
const NOTES_PER_BAR = STEPS.length

const TICK = TICK_MS / 1000
const MIN_MARGIN = LOOKAHEAD_SECONDS - TICK
const EPSILON = 1e-9

const zeroOffsets: Stage = (bar) => ({
  ...bar,
  notes: bar.notes.map((note) => ({ ...note, offsetBeats: 0 })),
})

const fullNegativeClamp: Stage = (bar) => ({
  ...bar,
  notes: bar.notes.map((note) => ({ ...note, offsetBeats: -CLAMP_BEATS })),
})

const SWUNG_PERCENT = 66.7

function swingSpy() {
  const seen: number[] = []
  const stage: Stage = (bar, ctx) => {
    seen.push(ctx.swingPercent)
    return bar
  }
  return { seen, stages: [...PIPELINE, zeroOffsets, stage] }
}

const BEAT_96 = 60 / 96
const BAR_96 = 4 * BEAT_96
const STEP_96 = BEAT_96 / 4

const BEAT_100 = 60 / 100
const BAR_100 = 4 * BEAT_100

const BEAT_120 = 60 / 120
const BAR_120 = 4 * BEAT_120

type Call = {
  articulation: Articulation
  velocity: number
  time: number
  variant: number
  committedAt: number
}

const STEPS_IN_BEAT = [0, 1, 2, 3].map((beat) =>
  STEPS.filter((step) => Math.floor(step / 4) === beat),
)

const notesInBeats = (beats: number) => {
  let total = 0
  for (let beat = 0; beat < beats; beat += 1) total += STEPS_IN_BEAT[beat % 4].length
  return total
}

type HarnessOptions = {
  readonly groove?: Groove
  readonly stages?: readonly Stage[]
}

function harness(options: HarnessOptions = {}) {
  let now = 0
  const calls: Call[] = []

  const scheduler = createScheduler(options.groove ?? FIXTURE, {
    clock: () => now,
    play: (articulation, velocity, time, variant) => {
      calls.push({ articulation, velocity, time, variant, committedAt: now })
    },
    stages: options.stages ?? [...PIPELINE, zeroOffsets],
  })

  return {
    scheduler,
    calls,
    times: () => calls.map((call) => call.time),
    tickAt: (at: number) => {
      now = at
      scheduler.tick()
    },
  }
}

describe('createScheduler', () => {
  it('plans nothing that lies beyond the lookahead window', () => {
    const { scheduler, calls, tickAt } = harness()

    scheduler.start(0.5, 96, STRAIGHT_PERCENT, 7)
    tickAt(0)

    expect(calls).toHaveLength(0)
  })

  it('plans a beat that falls inside the window before its time arrives', () => {
    const { scheduler, calls, tickAt } = harness()

    scheduler.start(LOOKAHEAD_SECONDS / 2, 96, STRAIGHT_PERCENT, 7)
    tickAt(0)

    expect(calls).toHaveLength(notesInBeats(1))
  })

  it('plans one beat at a time as the window reaches each beat line', () => {
    const { scheduler, calls, tickAt } = harness()

    scheduler.start(0, 96, STRAIGHT_PERCENT, 7)
    tickAt(0)
    expect(calls).toHaveLength(notesInBeats(1))

    tickAt(0.4)
    expect(calls).toHaveLength(notesInBeats(1))

    tickAt(0.55)
    expect(calls).toHaveLength(notesInBeats(2))
  })

  it('never plans a beat twice', () => {
    const { scheduler, calls, tickAt } = harness()

    scheduler.start(0, 96, STRAIGHT_PERCENT, 7)
    tickAt(0)
    tickAt(0)
    tickAt(0)

    expect(calls).toHaveLength(notesInBeats(1))
  })

  it('never commits a note more than one beat ahead of the clock', () => {
    const { scheduler, calls, tickAt } = harness()

    scheduler.start(0, 96, STRAIGHT_PERCENT, 7)
    for (let beat = 0; beat < 40; beat += 1) tickAt(beat * BEAT_96)

    expect(calls.length).toBeGreaterThan(30)
    for (const call of calls) {
      expect(call.time - call.committedAt).toBeLessThanOrEqual(
        BEAT_96 + LOOKAHEAD_SECONDS,
      )
    }
  })

  it('places bar 3 step 6 at 96 BPM where the arithmetic says', () => {
    const { scheduler, times, tickAt } = harness()
    const start = 1.25

    scheduler.start(start, 96, STRAIGHT_PERCENT, 7)
    tickAt(start + 3 * BAR_96 + BEAT_96)

    const step6 = times()[3 * NOTES_PER_BAR + STEPS.indexOf(6)]

    expect(step6).toBeCloseTo(start + 3 * 2.5 + 6 * 0.15625, 6)
  })

  it('places every note within 1 ms of its intended time', () => {
    const { scheduler, times, tickAt } = harness()
    const start = 1.25
    const bars = 16

    scheduler.start(start, 96, STRAIGHT_PERCENT, 7)
    for (let beat = 0; beat < bars * 4; beat += 1) tickAt(start + beat * BEAT_96)

    const intended = []
    for (let bar = 0; bar < bars; bar += 1) {
      for (const step of STEPS) {
        intended.push(start + bar * BAR_96 + step * STEP_96)
      }
    }

    const scheduled = times()
    expect(scheduled).toHaveLength(intended.length)
    for (const [index, want] of intended.entries()) {
      expect(Math.abs(scheduled[index] - want)).toBeLessThanOrEqual(0.001)
    }
  })

  it('accumulates no drift over 200 bars', () => {
    const { scheduler, times, tickAt } = harness()
    const start = 1.25
    const bars = 200

    scheduler.start(start, 100, STRAIGHT_PERCENT, 7)
    for (let beat = 0; beat < bars * 4; beat += 1) tickAt(start + beat * BEAT_100)

    const scheduled = times()
    expect(scheduled).toHaveLength(bars * NOTES_PER_BAR)
    expect(scheduled[scheduled.length - 1]).toBe(
      start + 199 * BAR_100 + (12 / 4) * BEAT_100,
    )
  })

  it('schedules the same times however irregularly it is ticked', () => {
    const steady = harness()
    steady.scheduler.start(0, 96, STRAIGHT_PERCENT, 7)
    for (let at = 0; at <= 12; at += 0.025) steady.tickAt(at)
    steady.tickAt(12)

    const jittery = harness()
    jittery.scheduler.start(0, 96, STRAIGHT_PERCENT, 7)
    for (const at of [0, 0.4, 3.7, 3.71, 3.72, 9.9, 11.99, 12]) {
      jittery.tickAt(at)
    }

    expect(jittery.times()).toEqual(steady.times())
  })

  it('drops nothing when a tick runs far too late', () => {
    const { scheduler, times, tickAt } = harness()

    scheduler.start(0, 96, STRAIGHT_PERCENT, 7)
    tickAt(20)

    const scheduled = times()
    const planned = Math.ceil(
      (20 + LOOKAHEAD_SECONDS + CLAMP_BEATS * BEAT_96) / BEAT_96,
    )

    expect(scheduled).toHaveLength(notesInBeats(planned))
    for (let index = 1; index < scheduled.length; index += 1) {
      expect(scheduled[index]).toBeGreaterThanOrEqual(scheduled[index - 1])
    }
  })

  it('takes a tempo change at the next beat line, mid-bar, and moves nothing scheduled', () => {
    const { scheduler, calls, times, tickAt } = harness()

    scheduler.start(0, 96, STRAIGHT_PERCENT, 7)
    tickAt(0)
    tickAt(0.6)

    const before = calls.map((call) => ({ ...call }))
    expect(before).toHaveLength(notesInBeats(2))

    scheduler.setTempo(120)
    for (let beat = 0; beat < 6; beat += 1) tickAt(2 * BEAT_96 + beat * BEAT_120)

    expect(calls.slice(0, before.length)).toEqual(before)

    const beatTwo = 2 * BEAT_96
    expect(beatTwo).not.toBe(BAR_96)
    expect(times()[3]).toBe(beatTwo + 0.5 * BEAT_120)
    expect(times()[4]).toBe(beatTwo + BEAT_120)
    expect(times()[5]).toBe(beatTwo + 2 * BEAT_120)
  })

  it('schedules nothing more after stop', () => {
    const { scheduler, calls, tickAt } = harness()

    scheduler.start(0, 96, STRAIGHT_PERCENT, 7)
    tickAt(0)
    const planned = calls.length

    scheduler.stop()
    tickAt(30)

    expect(calls).toHaveLength(planned)
  })

  it('starts a fresh performance after a stop', () => {
    const { scheduler, times, tickAt } = harness()

    scheduler.start(0, 96, STRAIGHT_PERCENT, 7)
    tickAt(0)
    scheduler.stop()
    const firstRun = times().length

    scheduler.start(100, 96, STRAIGHT_PERCENT, 7)
    for (let beat = 0; beat < 4; beat += 1) tickAt(100 + beat * BEAT_96)

    expect(times().slice(firstRun)).toEqual(
      STEPS.map((step) => 100 + step * STEP_96),
    )
  })

  it('reproduces a performance from the same seed', () => {
    const run = (seed: number) => {
      const { scheduler, calls, tickAt } = harness()
      scheduler.start(0, 96, STRAIGHT_PERCENT, seed)
      for (let beat = 0; beat < 32; beat += 1) tickAt(beat * BEAT_96)
      return calls
    }

    expect(run(1234)).toEqual(run(1234))
  })

  it('varies the variants with the seed and never the times', () => {
    const run = (seed: number) => {
      const { scheduler, calls, tickAt } = harness()
      scheduler.start(0, 96, STRAIGHT_PERCENT, seed)
      for (let beat = 0; beat < 32; beat += 1) tickAt(beat * BEAT_96)
      return calls
    }

    const one = run(1234)
    const other = run(5678)

    expect(other.map((call) => call.time)).toEqual(one.map((call) => call.time))
    expect(other.map((call) => call.variant)).not.toEqual(
      one.map((call) => call.variant),
    )
  })

  for (const tempo of [60, 96, 180]) {
    for (const swingPercent of [STRAIGHT_PERCENT, SWUNG_PERCENT]) {
      it(`keeps at least 75 ms between the call and a note pulled back by the full clamp at ${tempo} BPM and ${swingPercent}% swing`, () => {
        const { scheduler, calls, tickAt } = harness({
          groove: BEAT_HEAD_FIXTURE,
          stages: [...PIPELINE, fullNegativeClamp],
        })
        const start = 1.25
        const ticks = Math.ceil((start + 16 * secondsPerBeat(tempo)) / TICK)

        scheduler.start(start, tempo, swingPercent, 7)
        for (let index = 0; index <= ticks; index += 1) tickAt(index * TICK)

        expect(calls.length).toBeGreaterThanOrEqual(16)
        for (const call of calls) {
          const margin = call.time - call.committedAt
          expect(margin).toBeGreaterThanOrEqual(MIN_MARGIN - EPSILON)
          expect(margin).toBeLessThanOrEqual(LOOKAHEAD_SECONDS + EPSILON)
        }
      })
    }
  }

  it('widens the horizon by a clamp width that is larger in seconds the slower the tempo', () => {
    const extraHorizon = (tempo: number) => {
      const scan = 1e-4
      const start = 2 * secondsPerBeat(tempo)
      const { scheduler, calls, tickAt } = harness({ groove: BEAT_HEAD_FIXTURE })

      scheduler.start(start, tempo, STRAIGHT_PERCENT, 7)
      let index = 0
      while (calls.length === 0 && index * scan < start) {
        tickAt(index * scan)
        index += 1
      }

      expect(calls.length).toBeGreaterThan(0)
      return start - calls[0].committedAt - LOOKAHEAD_SECONDS
    }

    const slow = extraHorizon(60)
    const fast = extraHorizon(180)

    expect(slow).toBeCloseTo(CLAMP_BEATS * secondsPerBeat(60), 3)
    expect(fast).toBeCloseTo(CLAMP_BEATS * secondsPerBeat(180), 3)
    expect(slow - fast).toBeCloseTo(
      CLAMP_BEATS * (secondsPerBeat(60) - secondsPerBeat(180)),
      3,
    )
    expect(slow).toBeGreaterThan(fast)
  })

  it('plans every beat exactly once and in order when ticked at the tick rate', () => {
    const { scheduler, times, tickAt } = harness()
    const start = 1.25
    const bars = 8
    const ticks = Math.ceil((start + bars * BAR_96) / TICK)

    scheduler.start(start, 96, STRAIGHT_PERCENT, 7)
    for (let index = 0; index <= ticks; index += 1) tickAt(index * TICK)

    const intended: number[] = []
    for (let bar = 0; bar < bars; bar += 1) {
      for (const step of STEPS) intended.push(start + bar * BAR_96 + step * STEP_96)
    }

    const scheduled = times().slice(0, intended.length)
    expect(scheduled).toHaveLength(intended.length)
    for (const [index, want] of intended.entries()) {
      expect(scheduled[index]).toBeCloseTo(want, 9)
    }
  })

  it('takes a tempo change within one beat of the widened horizon, whenever it is called', () => {
    const bound = BEAT_96 + LOOKAHEAD_SECONDS + CLAMP_BEATS * BEAT_96
    const trails: number[] = []

    for (let call = 4; call < 84; call += 1) {
      const { scheduler, times, tickAt } = harness({ groove: BEAT_HEAD_FIXTURE })
      const changeAt = call * TICK

      scheduler.start(0, 96, STRAIGHT_PERCENT, 7)
      for (let index = 0; index <= call; index += 1) tickAt(index * TICK)

      const before = times().length
      scheduler.setTempo(60)
      for (let index = call; index <= call + 400; index += 1) tickAt(index * TICK)

      const anchor = times()[before - 1] + BEAT_96
      expect(times()[before]).toBeCloseTo(anchor, 9)
      expect(times()[before + 1] - times()[before]).toBeCloseTo(
        secondsPerBeat(60),
        9,
      )
      trails.push(anchor - changeAt)
    }

    for (const trail of trails) {
      expect(trail).toBeGreaterThan(0)
      expect(trail).toBeLessThanOrEqual(bound + EPSILON)
    }
  })

  it('takes a swing change within one beat of the widened horizon, whenever it is called', () => {
    const bound = BEAT_96 + LOOKAHEAD_SECONDS + CLAMP_BEATS * BEAT_96
    const trails: number[] = []

    for (let call = 4; call < 84; call += 1) {
      const { seen, stages } = swingSpy()
      const { scheduler, times, tickAt } = harness({
        groove: BEAT_HEAD_FIXTURE,
        stages,
      })
      const changeAt = call * TICK

      scheduler.start(0, 96, STRAIGHT_PERCENT, 7)
      for (let index = 0; index <= call; index += 1) tickAt(index * TICK)

      const before = times().length
      const planned = seen.length
      scheduler.setSwing(SWUNG_PERCENT)
      for (let index = call; index <= call + 400; index += 1) tickAt(index * TICK)

      expect(seen.slice(0, planned)).toEqual(
        seen.slice(0, planned).map(() => STRAIGHT_PERCENT),
      )
      expect(seen[planned]).toBe(SWUNG_PERCENT)

      trails.push(times()[before] - changeAt)
    }

    for (const trail of trails) {
      expect(trail).toBeGreaterThan(0)
      expect(trail).toBeLessThanOrEqual(bound + EPSILON)
    }
  })

  it('plans every beat with the swing percentage it was started with', () => {
    const { seen, stages } = swingSpy()
    const { scheduler, tickAt } = harness({ stages })

    scheduler.start(0, 96, SWUNG_PERCENT, 7)
    for (let beat = 0; beat < 8; beat += 1) tickAt(beat * BEAT_96)

    expect(seen.length).toBeGreaterThan(4)
    expect(seen).toEqual(seen.map(() => SWUNG_PERCENT))
  })

  it('plans with the swing setSwing was given, from the next beat and not before', () => {
    const { seen, stages } = swingSpy()
    const { scheduler, calls, tickAt } = harness({ stages })

    scheduler.start(0, 96, STRAIGHT_PERCENT, 7)
    for (let beat = 0; beat < 3; beat += 1) tickAt(beat * BEAT_96)

    const planned = [...seen]
    const committed = calls.map((call) => ({ ...call }))
    expect(planned.length).toBeGreaterThan(0)
    expect(planned).toEqual(planned.map(() => STRAIGHT_PERCENT))

    scheduler.setSwing(SWUNG_PERCENT)
    expect(seen).toEqual(planned)
    expect(calls).toEqual(committed)

    for (let beat = 3; beat < 8; beat += 1) tickAt(beat * BEAT_96)

    const after = seen.slice(planned.length)
    expect(after.length).toBeGreaterThan(0)
    expect(after).toEqual(after.map(() => SWUNG_PERCENT))
  })

  it('moves no beat line when the swing changes', () => {
    const run = (change: boolean) => {
      const { scheduler, times, tickAt } = harness({ groove: BEAT_HEAD_FIXTURE })
      const start = 1.25

      scheduler.start(start, 100, STRAIGHT_PERCENT, 7)
      for (let beat = 0; beat < 200; beat += 1) {
        if (change && beat === 38) scheduler.setSwing(SWUNG_PERCENT)
        tickAt(start + beat * BEAT_100)
      }
      return times()
    }

    expect(run(true)).toEqual(run(false))
  })

  it('accumulates no drift over 200 bars when the swing changes mid-performance', () => {
    const { scheduler, times, tickAt } = harness({ groove: BEAT_HEAD_FIXTURE })
    const start = 1.25
    const bars = 200

    scheduler.start(start, 100, STRAIGHT_PERCENT, 7)
    for (let beat = 0; beat < bars * 4; beat += 1) {
      if (beat === 38) scheduler.setSwing(SWUNG_PERCENT)
      tickAt(start + beat * BEAT_100)
    }

    const scheduled = times()
    expect(scheduled[scheduled.length - 1]).toBe(
      start + 199 * BAR_100 + (12 / 4) * BEAT_100,
    )
  })

  it('warps the grid it plays, delaying only the odd steps of a beat', () => {
    const bar = (swingPercent: number) => {
      const { scheduler, times, tickAt } = harness({ groove: EVERY_STEP_FIXTURE })
      const start = 1.25

      scheduler.start(start, 96, swingPercent, 7)
      for (let beat = 0; beat < 4; beat += 1) tickAt(start + beat * BEAT_96)

      return times().map((time) => time - start)
    }

    const straight = bar(STRAIGHT_PERCENT)
    const swung = bar(SWUNG_PERCENT)
    const pairBeats = 0.5
    const delay = pairBeats * ((SWUNG_PERCENT - STRAIGHT_PERCENT) / 100) * BEAT_96

    expect(swung).toHaveLength(straight.length)
    expect(delay).toBeGreaterThan(0)

    straight.forEach((time, step) => {
      const expected = step % 2 === 0 ? time : time + delay
      expect(swung[step]).toBeCloseTo(expected, 9)
    })
  })
})
