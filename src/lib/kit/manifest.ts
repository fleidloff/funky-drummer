import type { Articulation, Voice } from './voices'

export type SampleEntry =
  | { readonly kind: 'files'; readonly files: readonly string[] }
  | { readonly kind: 'substituted'; readonly by: Articulation; readonly why: string }

export type Kit = {
  readonly name: string
  readonly targetRmsDb: number
  readonly rmsWindowMs: number
  readonly gains: Readonly<Record<Voice, number>>
  readonly samples: Readonly<Record<Articulation, SampleEntry>>
}

const files = (...paths: readonly string[]): SampleEntry => ({ kind: 'files', files: paths })

export const KIT: Kit = {
  name: 'MuldjordKit + imports',
  targetRmsDb: -21.0,
  rmsWindowMs: 100,
  gains: {
    kick: 1.0,
    snare: 0.89,
    toms: 0.71,
    crash: 0.56,
    cowbell: 0.5,
    ride: 0.45,
    hihat: 0.4,
    shaker: 0.25,
  },
  samples: {
    'kick.hard': files('/samples/kick/hard.ogg'),
    'kick.soft': files('/samples/kick/soft.ogg'),
    'snare.backbeat': files('/samples/snare/backbeat.ogg'),
    'snare.normal': files('/samples/snare/normal.ogg'),
    'snare.ghost': files(
      '/samples/snare/ghost-1.ogg',
      '/samples/snare/ghost-2.ogg',
      '/samples/snare/ghost-3.ogg',
    ),
    'snare.crossStick': files(
      '/samples/snare/crossStick-1.ogg',
      '/samples/snare/crossStick-2.ogg',
    ),
    'hihat.closed': files(
      '/samples/hihat/closed-1.ogg',
      '/samples/hihat/closed-2.ogg',
      '/samples/hihat/closed-3.ogg',
    ),
    'hihat.accent': files('/samples/hihat/accent.ogg'),
    'hihat.open': files('/samples/hihat/open.ogg'),
    'hihat.pedal': files('/samples/hihat/pedal.ogg'),
    'ride.bow': files('/samples/ride/bow.ogg'),
    'ride.bell': files('/samples/ride/bell.ogg'),
    'cowbell.hit': files('/samples/cowbell/hit.ogg'),
    'shaker.hit': files(
      '/samples/shaker/hit-1.ogg',
      '/samples/shaker/hit-2.ogg',
      '/samples/shaker/hit-3.ogg',
    ),
    'toms.rack': files('/samples/toms/rack.ogg'),
    'toms.floor': files('/samples/toms/floor.ogg'),
    'crash.hit': files('/samples/crash/hit.ogg'),
  },
}
