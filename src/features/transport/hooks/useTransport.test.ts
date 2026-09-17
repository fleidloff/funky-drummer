import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CLAMP_BEATS } from '@/lib/pipeline'
import { START_LEAD_SECONDS } from './useTransport'
import { TICK_MS } from '../lib/scheduler'
import type { TransportControls } from '../types'
import { useTransport } from './useTransport'

const TEMPO_FLOOR = 60
const BEAT_96 = 60 / 96
const BEAT_120 = 60 / 120

const offGrid = (times: readonly number[], secondsPerBeat: number) => {
  const sixteenth = secondsPerBeat / 4
  const anchor = Math.min(...times)
  return Math.max(
    ...times.map((time) => {
      const steps = (time - anchor) / sixteenth
      return Math.abs(steps - Math.round(steps)) * sixteenth
    }),
  )
}

const gridSlack = (secondsPerBeat: number) => 2 * CLAMP_BEATS * secondsPerBeat

type Started = { time: number }

const started: Started[] = []
const contexts: FakeContext[] = []
const fetched: string[] = []
let failingPaths: readonly string[] = []

type FakeContext = {
  currentTime: number
  destination: unknown
  resume: ReturnType<typeof vi.fn>
  decodeAudioData: (bytes: ArrayBuffer) => Promise<AudioBuffer>
  createBufferSource: () => unknown
  createGain: () => unknown
}

function FakeAudioContext(this: FakeContext) {
  const context: FakeContext = {
    currentTime: 0,
    destination: {},
    resume: vi.fn(() => Promise.resolve()),
    decodeAudioData: () => Promise.resolve({} as AudioBuffer),
    createBufferSource: () => ({
      buffer: null,
      connect: () => {},
      start: (when: number) => {
        started.push({ time: when })
      },
    }),
    createGain: () => ({ gain: { value: 1 }, connect: () => {} }),
  }
  contexts.push(context)
  return context
}

const current = () => contexts[contexts.length - 1]

const flush = async () => {
  for (let turn = 0; turn < 40; turn += 1) await Promise.resolve()
}

const advanceTo = (seconds: number) =>
  act(() => {
    current().currentTime = seconds
    vi.advanceTimersByTime(TICK_MS)
  })

const waveAfter = (action: () => void) => {
  const before = started.length
  action()
  return started.slice(before).map((hit) => hit.time)
}

beforeEach(() => {
  vi.useFakeTimers()
  started.length = 0
  contexts.length = 0
  fetched.length = 0
  failingPaths = []
  vi.stubGlobal('AudioContext', FakeAudioContext)
  vi.stubGlobal('fetch', (input: RequestInfo | URL) => {
    const path = String(input)
    fetched.push(path)
    if (failingPaths.some((failing) => path.includes(failing))) {
      return Promise.reject(new Error('offline'))
    }
    return Promise.resolve({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    } as Response)
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

async function mount() {
  const rendered = renderHook(() => useTransport())
  await act(async () => {
    await flush()
  })
  return rendered
}

describe('useTransport', () => {
  it('rests at the values docs/music.md gives the controls', async () => {
    const { result } = await mount()

    expect(result.current.state).toMatchObject({
      playing: false,
      autoFill: false,
      autoFeel: false,
      tempo: 96,
      swing: 54,
      feel: 0.5,
    })
    expect(Object.values(result.current.state.voices).every(Boolean)).toBe(true)
  })

  it('builds one context and fetches every sample once', async () => {
    const { rerender } = await mount()
    const requested = fetched.length

    rerender()
    await act(async () => {
      await flush()
    })

    expect(contexts).toHaveLength(1)
    expect(fetched).toHaveLength(requested)
    expect(new Set(fetched).size).toBe(fetched.length)
  })

  it('schedules nothing until play', async () => {
    await mount()

    await advanceTo(4)

    expect(started).toHaveLength(0)
  })

  it('resumes the context and ticks once playing', async () => {
    const { result } = await mount()

    act(() => {
      result.current.togglePlaying()
    })

    expect(result.current.state.playing).toBe(true)
    expect(current().resume).toHaveBeenCalledTimes(1)

    const wave = waveAfter(() => {
      void advanceTo(0.05)
    })

    expect(wave.length).toBeGreaterThan(0)
  })

  it('stops ticking on stop', async () => {
    const { result } = await mount()

    act(() => {
      result.current.togglePlaying()
    })
    await advanceTo(0.05)

    act(() => {
      result.current.togglePlaying()
    })
    const wave = waveAfter(() => {
      void advanceTo(20)
    })

    expect(result.current.state.playing).toBe(false)
    expect(wave).toHaveLength(0)
  })

  it('stops ticking on unmount', async () => {
    const { result, unmount } = await mount()

    act(() => {
      result.current.togglePlaying()
    })
    await advanceTo(0.05)

    unmount()
    const wave = waveAfter(() => {
      act(() => {
        current().currentTime = 20
        vi.advanceTimersByTime(TICK_MS * 4)
      })
    })

    expect(wave).toHaveLength(0)
  })

  const twoTempoWaves = async (result: { current: TransportControls }) => {
    act(() => {
      result.current.togglePlaying()
    })

    const at96 = waveAfter(() => {
      for (let beat = 0; beat < 8; beat += 1) void advanceTo(0.05 + beat * BEAT_96)
    })

    act(() => {
      result.current.setTempo(120)
    })

    const at120 = waveAfter(() => {
      for (let beat = 1; beat < 9; beat += 1) {
        void advanceTo(0.05 + 8 * BEAT_96 + beat * BEAT_120)
      }
    })

    return { at96, at120 }
  }

  it('hands a tempo change to the scheduler, and it lands within a beat', async () => {
    const { result } = await mount()
    const { at96, at120 } = await twoTempoWaves(result)

    expect(result.current.state.tempo).toBe(120)

    expect(offGrid(at96, BEAT_96)).toBeLessThanOrEqual(gridSlack(BEAT_96))
    expect(offGrid(at120, BEAT_120)).toBeLessThanOrEqual(gridSlack(BEAT_120))
  })

  it('spaces notes by the new tempo and not by the old one', async () => {
    const { result } = await mount()
    const { at96, at120 } = await twoTempoWaves(result)

    expect(offGrid(at96, BEAT_120)).toBeGreaterThan(gridSlack(BEAT_120))
    expect(offGrid(at120, BEAT_96)).toBeGreaterThan(gridSlack(BEAT_96))
  })

  it('leaves the first note of a performance in the future at the slowest tempo', async () => {
    const { result } = await mount()

    act(() => {
      result.current.setTempo(TEMPO_FLOOR)
    })

    const slowestBeat = 60 / TEMPO_FLOOR
    const worstPullBack = CLAMP_BEATS * slowestBeat

    expect(START_LEAD_SECONDS).toBeGreaterThan(worstPullBack)

    act(() => {
      result.current.togglePlaying()
    })

    const clockAtStart = current().currentTime
    const wave = waveAfter(() => {
      void advanceTo(clockAtStart)
    })

    expect(wave.length).toBeGreaterThan(0)
    expect(Math.min(...wave) - clockAtStart).toBeGreaterThan(0)
    expect(Math.min(...wave) - clockAtStart).toBeGreaterThanOrEqual(
      START_LEAD_SECONDS - worstPullBack,
    )
  })

  it('warns once naming the articulations that have no sample', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    failingPaths = ['/kick/']

    await mount()

    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0][0])).toContain('kick.hard')
  })

  it('leaves the dummy controls to state alone', async () => {
    const { result } = await mount()

    act(() => {
      result.current.setSwing(60)
      result.current.setFeel(0.25)
      result.current.toggleAutoFill()
      result.current.toggleAutoFeel()
      result.current.toggleVoice('snare')
    })

    expect(result.current.state).toMatchObject({
      swing: 60,
      feel: 0.25,
      autoFill: true,
      autoFeel: true,
    })
    expect(result.current.state.voices.snare).toBe(false)
    expect(started).toHaveLength(0)
  })
})
