'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { STRAIGHT_SIXTEEN } from '@/lib/grooves'
import type { Voice } from '@/lib/kit/voices'
import { VOICES } from '@/lib/kit/voices'
import { createPlayer } from '../lib/player'
import type { Scheduler } from '../lib/scheduler'
import { TICK_MS, createScheduler } from '../lib/scheduler'
import type { TransportControls, TransportState } from '../types'

const INITIAL_TEMPO = 96
const INITIAL_SWING = 54
const INITIAL_FEEL = 0.5
export const START_LEAD_SECONDS = 0.1
const SEED_RANGE = 2 ** 32

const allVoicesPlaying = (): Record<Voice, boolean> =>
  Object.fromEntries(VOICES.map((voice) => [voice, true])) as Record<
    Voice,
    boolean
  >

export function useTransport(): TransportControls {
  const [state, setState] = useState<TransportState>({
    playing: false,
    autoFill: false,
    autoFeel: false,
    tempo: INITIAL_TEMPO,
    swing: INITIAL_SWING,
    feel: INITIAL_FEEL,
    voices: allVoicesPlaying(),
  })

  const contextRef = useRef<AudioContext | null>(null)
  const schedulerRef = useRef<Scheduler | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return
    clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  useEffect(() => {
    const context = new AudioContext()
    const player = createPlayer(context)

    contextRef.current = context
    schedulerRef.current = createScheduler(STRAIGHT_SIXTEEN, {
      clock: () => context.currentTime,
      play: player.play,
    })

    void player.load().then(({ failed }) => {
      if (failed.length > 0) {
        console.warn(`funky-drummer: no sample for ${failed.join(', ')}`)
      }
    })

    return clearTimer
  }, [clearTimer])

  const togglePlaying = () => {
    const context = contextRef.current
    const scheduler = schedulerRef.current
    if (!context || !scheduler) return

    if (state.playing) {
      clearTimer()
      scheduler.stop()
      setState((it) => ({ ...it, playing: false }))
      return
    }

    void context.resume()
    scheduler.start(
      context.currentTime + START_LEAD_SECONDS,
      state.tempo,
      state.swing,
      Math.floor(Math.random() * SEED_RANGE),
    )
    timerRef.current = setInterval(() => scheduler.tick(), TICK_MS)
    setState((it) => ({ ...it, playing: true }))
  }

  return {
    state,
    togglePlaying,
    toggleAutoFill: () => setState((it) => ({ ...it, autoFill: !it.autoFill })),
    toggleAutoFeel: () => setState((it) => ({ ...it, autoFeel: !it.autoFeel })),
    setTempo: (value: number) => {
      schedulerRef.current?.setTempo(value)
      setState((it) => ({ ...it, tempo: value }))
    },
    setSwing: (value: number) => {
      schedulerRef.current?.setSwing(value)
      setState((it) => ({ ...it, swing: value }))
    },
    setFeel: (value: number) => setState((it) => ({ ...it, feel: value })),
    toggleVoice: (voice: Voice) =>
      setState((it) => ({
        ...it,
        voices: { ...it.voices, [voice]: !it.voices[voice] },
      })),
  }
}
