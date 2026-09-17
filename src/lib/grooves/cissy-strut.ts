import { parseGroove } from '../groove/parse'
import type { Groove } from '../groove/types'

export const cissyStrut: Groove = parseGroove({
  id: 'cissy-strut',
  name: 'Cissy Strut',
  after: 'Joseph "Zigaboo" Modeliste',
  tempo: 88,
  swing: 57,
  bars: [
    {
      hihat: 'x x x x x x x X x x x x x x x x',
      snare: '. . . . . . . X . . o . # . # .',
      kick: '# . . . . x . . . . x . . . . .',
    },
  ],
})
