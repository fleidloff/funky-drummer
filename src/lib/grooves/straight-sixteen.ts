import { parseGroove } from '../groove/parse'
import type { Groove } from '../groove/types'

export const straightSixteen: Groove = parseGroove({
  id: 'straight-sixteen',
  name: 'Straight Sixteen',
  tempo: 96,
  swing: 52,
  bars: [
    {
      hihat: 'x x x x x x x x x x x x x x x x',
      snare: '. . . . # . . o . o . . # . . o',
      kick: '# . . x . . X . . . X . . . x .',
    },
  ],
})
