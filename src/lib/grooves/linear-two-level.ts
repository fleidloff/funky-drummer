import { parseGroove } from '../groove/parse'
import type { Groove } from '../groove/types'

export const linearTwoLevel: Groove = parseGroove({
  id: 'linear-two-level',
  name: 'Linear Two-Level',
  after: 'David Garibaldi',
  tempo: 100,
  swing: 54,
  bars: [
    {
      hihat: '. x x x . x . . x x . x . x . .',
      snare: '. . . . # . . o . . . . # . o .',
      kick: '# . . . . . x . . . x . . . . x',
    },
  ],
})
