export type VoiceId =
  | 'kick'
  | 'snare'
  | 'hiHat'
  | 'ride'
  | 'cowbell'
  | 'shaker'
  | 'toms'
  | 'crash'

export type PanelState = {
  playing: boolean
  autoFill: boolean
  autoFeel: boolean
  tempo: number
  swing: number
  feel: number
  voices: Record<VoiceId, boolean>
}
