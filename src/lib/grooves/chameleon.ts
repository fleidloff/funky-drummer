import { parseGroove } from '../groove/parse'
import type { Groove } from '../groove/types'

export const chameleon: Groove = parseGroove({
  id: 'chameleon',
  name: 'Chameleon',
  after: 'Harvey Mason',
  tempo: 110,
  swing: 50,
  bars: [
    {
      hihat: 'x . x . x . x . x . x . x . x .',
      snare: '. . . # . . . . . . . . # . . .',
      kick: '# . . . . . x . . . X . . . . .',
    },
  ],
})
