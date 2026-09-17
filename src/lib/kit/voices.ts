export type Voice =
  | 'kick'
  | 'snare'
  | 'hihat'
  | 'ride'
  | 'cowbell'
  | 'shaker'
  | 'toms'
  | 'crash'

const ARTICULATIONS_BY_VOICE = {
  kick: ['hard', 'soft'],
  snare: ['backbeat', 'normal', 'ghost', 'crossStick'],
  hihat: ['closed', 'accent', 'open', 'pedal'],
  ride: ['bow', 'bell'],
  cowbell: ['hit'],
  shaker: ['hit'],
  toms: ['rack', 'floor'],
  crash: ['hit'],
} as const satisfies Record<Voice, readonly string[]>

export type Articulation = {
  [V in Voice]: `${V}.${(typeof ARTICULATIONS_BY_VOICE)[V][number]}`
}[Voice]

export const VOICES: readonly Voice[] = Object.keys(
  ARTICULATIONS_BY_VOICE,
) as Voice[]

export const ARTICULATIONS: readonly Articulation[] = VOICES.flatMap((voice) =>
  ARTICULATIONS_BY_VOICE[voice].map(
    (articulation) => `${voice}.${articulation}` as Articulation,
  ),
)

export function voiceOf(articulation: Articulation): Voice {
  return articulation.slice(0, articulation.indexOf('.')) as Voice
}
