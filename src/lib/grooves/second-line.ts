import { parseGroove } from '../groove/parse'
import type { Groove } from '../groove/types'

export const secondLine: Groove = parseGroove({
  id: 'second-line',
  name: 'Second Line',
  tempo: 92,
  swing: 58,
  bars: [
    {
      hihat: 'x . x . x . x . x . x . x . x .',
      snare: '. . o . # . . o . . X . o . X .',
      kick: '# . . x . . . . x . . x . . . .',
      cowbell: 'x . . x . . x . . . x . . x . .',
    },
  ],
})
