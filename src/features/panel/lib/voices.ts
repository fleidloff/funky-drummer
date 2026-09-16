import type { VoiceId } from '../types'

export const voiceOrder: readonly VoiceId[] = [
  'kick',
  'snare',
  'hiHat',
  'ride',
  'cowbell',
  'shaker',
  'toms',
  'crash',
]

export const allPlaying: Record<VoiceId, boolean> = {
  kick: true,
  snare: true,
  hiHat: true,
  ride: true,
  cowbell: true,
  shaker: true,
  toms: true,
  crash: true,
}
