import { parseGroove } from '../groove/parse'
import type { Groove } from '../groove/types'

export const coldSweat: Groove = parseGroove({
  id: 'cold-sweat',
  name: 'Cold Sweat',
  after: 'Clyde Stubblefield',
  tempo: 108,
  swing: 52,
  secondaryOne: 2,
  bars: [
    {
      hihat: 'x x x x x x x x x x x x x x x x',
      snare: '. . . . # . . o . o . . . . # .',
      kick: '# . . . . . x . . . . . . . . .',
    },
    {
      hihat: 'x x x x x x x x x x x x x x x x',
      snare: '. o . . # . . o . o . . # . . .',
      kick: '. . x . . . . . . . . . x . . .',
    },
  ],
})
