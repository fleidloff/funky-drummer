import { parseGroove } from '../groove/parse'
import type { Groove } from '../groove/types'

export const fourOnTheFloorFunk: Groove = parseGroove({
  id: 'four-on-the-floor-funk',
  name: 'Four On The Floor Funk',
  tempo: 118,
  swing: 50,
  bars: [
    {
      hihat: 'x . O . x . O . x . O . x . O .',
      snare: '. . . . # . . . . . . . # . . .',
      kick: '# . . . # . . . # . . . # . . .',
    },
  ],
})
