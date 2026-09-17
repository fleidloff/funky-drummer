import { parseGroove } from '../groove/parse'
import type { Groove } from '../groove/types'

export const funkyDrummer: Groove = parseGroove({
  id: 'funky-drummer',
  name: 'Funky Drummer',
  after: 'Clyde Stubblefield',
  tempo: 94,
  swing: 52,
  bars: [
    {
      hihat: 'x x x x x O x x x x x x x O x x',
      snare: '. . . o # . . o . o o . # . o o',
      kick: '# . x . . . . . X . . x . . . .',
    },
  ],
})
