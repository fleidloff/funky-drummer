'use client'

import { useState } from 'react'
import { feel, swing, tempo } from '../lib/ranges'
import { allPlaying } from '../lib/voices'
import type { PanelState, VoiceId } from '../types'

export function usePanelState() {
  const [state, setState] = useState<PanelState>({
    playing: false,
    autoFill: false,
    autoFeel: false,
    tempo: tempo.initial,
    swing: swing.initial,
    feel: feel.initial,
    voices: allPlaying,
  })

  return {
    state,
    togglePlaying: () => setState((it) => ({ ...it, playing: !it.playing })),
    toggleAutoFill: () => setState((it) => ({ ...it, autoFill: !it.autoFill })),
    toggleAutoFeel: () => setState((it) => ({ ...it, autoFeel: !it.autoFeel })),
    setTempo: (value: number) => setState((it) => ({ ...it, tempo: value })),
    setSwing: (value: number) => setState((it) => ({ ...it, swing: value })),
    setFeel: (value: number) => setState((it) => ({ ...it, feel: value })),
    toggleVoice: (voice: VoiceId) =>
      setState((it) => ({ ...it, voices: { ...it.voices, [voice]: !it.voices[voice] } })),
  }
}

export type PanelControls = ReturnType<typeof usePanelState>
