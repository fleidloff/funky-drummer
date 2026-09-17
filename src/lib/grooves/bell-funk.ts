import { parseGroove } from '../groove/parse'
import type { Groove } from '../groove/types'

export const bellFunk: Groove = parseGroove({
  id: 'bell-funk',
  name: 'Bell Funk',
  tempo: 104,
  swing: 54,
  bars: [
    {
      cowbell: 'X . . x . . X . . x X . . x . .',
      snare: '. . . . # . . o . o . . # . . .',
      kick: '# . . . . . x . . . X . . . x .',
    },
  ],
})
