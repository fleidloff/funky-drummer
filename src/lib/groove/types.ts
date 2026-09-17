export type Lane =
  | 'kick'
  | 'snare'
  | 'hihat'
  | 'ride'
  | 'cowbell'
  | 'shaker'
  | 'tom1'
  | 'tom2'
  | 'crash'

export const LANES: readonly Lane[] = [
  'kick',
  'snare',
  'hihat',
  'ride',
  'cowbell',
  'shaker',
  'tom1',
  'tom2',
  'crash',
]

export type Level = 'ghost' | 'normal' | 'accent' | 'anchor'

export type GridNote = {
  readonly step: number
  readonly lane: Lane
  readonly level: Level
  readonly open?: true
  readonly bell?: true
}

export type Bar = readonly GridNote[]

export type Groove = {
  readonly id: string
  readonly name: string
  readonly after?: string
  readonly tempo: number
  readonly swing: number
  readonly secondaryOne?: number
  readonly bars: readonly Bar[]
}

export const STEPS_PER_BAR = 16
