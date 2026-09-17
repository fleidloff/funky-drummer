import type { Voice } from '@/lib/kit/voices'

export type TransportState = {
  playing: boolean
  autoFill: boolean
  autoFeel: boolean
  tempo: number
  swing: number
  feel: number
  voices: Record<Voice, boolean>
}

export type TransportControls = {
  state: TransportState
  togglePlaying: () => void
  toggleAutoFill: () => void
  toggleAutoFeel: () => void
  setTempo: (value: number) => void
  setSwing: (value: number) => void
  setFeel: (value: number) => void
  toggleVoice: (voice: Voice) => void
}
