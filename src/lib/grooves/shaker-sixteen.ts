import { parseGroove } from '../groove/parse'
import type { Groove } from '../groove/types'

export const shakerSixteen: Groove = parseGroove({
  id: 'shaker-sixteen',
  name: 'Shaker Sixteen',
  tempo: 98,
  swing: 54,
  bars: [
    {
      shaker: 'X . x . X . x . X . x . X . x .',
      hihat: '. . . . x . . . . . . . x . . .',
      snare: '. . . o # . . o . o . . # . . o',
      kick: '# . . x . . . . X . . . . x . .',
    },
  ],
})
