import { describe, expect, it } from 'vitest'
import type { Lane } from './types'
import { parseGroove, type GrooveSource } from './parse'

type GridBar = Partial<Record<Lane, string>>

const source = (id: string, bars: GrooveSource['bars']): GrooveSource => ({
  id,
  name: 'Fixture',
  tempo: 96,
  swing: 50,
  bars,
})

const GRID = {
  hihat: 'x . x . x . x . x . x . x . x .',
  snare: '. . . . # . . o . o . . # . . o',
  kick: '# . . x . . X . . . X . . . x .',
} satisfies GridBar

const TIGHT = {
  hihat: 'x.x.x.x.x.x.x.x.',
  snare: '....#..o.o..#..o',
  kick: '#..x..X...X...x.',
} satisfies GridBar

const NOTES = [
  { step: 0, lane: 'kick', level: 'anchor' },
  { step: 0, lane: 'hihat', level: 'normal' },
  { step: 2, lane: 'hihat', level: 'normal' },
  { step: 3, lane: 'kick', level: 'normal' },
  { step: 4, lane: 'snare', level: 'anchor' },
  { step: 4, lane: 'hihat', level: 'normal' },
  { step: 6, lane: 'kick', level: 'accent' },
  { step: 6, lane: 'hihat', level: 'normal' },
  { step: 7, lane: 'snare', level: 'ghost' },
  { step: 8, lane: 'hihat', level: 'normal' },
  { step: 9, lane: 'snare', level: 'ghost' },
  { step: 10, lane: 'kick', level: 'accent' },
  { step: 10, lane: 'hihat', level: 'normal' },
  { step: 12, lane: 'snare', level: 'anchor' },
  { step: 12, lane: 'hihat', level: 'normal' },
  { step: 14, lane: 'kick', level: 'normal' },
  { step: 14, lane: 'hihat', level: 'normal' },
  { step: 15, lane: 'snare', level: 'ghost' },
]

const spread = (lane: string) => [...lane].join('   ')
const padded = (lane: string) => '   ' + [...lane].join(' ') + '  '
const respace = (bar: GridBar, space: (lane: string) => string): GridBar =>
  Object.fromEntries(
    Object.entries(bar).map(([lane, steps]) => [lane, space(steps)]),
  ) as GridBar

describe('parseGroove', () => {
  it('reads o, x, X and # as ghost, normal, accent and anchor, and . as no note at all', () => {
    expect(parseGroove(source('straight', [GRID])).bars[0]).toEqual(NOTES)
  })

  it('parses a grid the same however its steps are spaced', () => {
    for (const bar of [TIGHT, respace(TIGHT, spread), respace(TIGHT, padded)]) {
      expect(parseGroove(source('spacing', [bar])).bars[0]).toEqual(NOTES)
    }
  })

  it('leaves an omitted lane silent', () => {
    expect(parseGroove(source('kick-only', [{ kick: TIGHT.kick }])).bars[0]).toEqual([
      { step: 0, lane: 'kick', level: 'anchor' },
      { step: 3, lane: 'kick', level: 'normal' },
      { step: 6, lane: 'kick', level: 'accent' },
      { step: 10, lane: 'kick', level: 'accent' },
      { step: 14, lane: 'kick', level: 'normal' },
    ])
  })

  it('reads O on hihat as an open accent, and leaves a normal hat closed', () => {
    const bar = parseGroove(source('open-hat', [{ hihat: 'Ox' + '.'.repeat(14) }])).bars[0]

    expect(bar).toEqual([
      { step: 0, lane: 'hihat', level: 'accent', open: true },
      { step: 1, lane: 'hihat', level: 'normal' },
    ])
  })

  it('reads B on ride as a bell accent, and leaves a normal ride unbelled', () => {
    const bar = parseGroove(source('bell', [{ ride: 'Bx' + '.'.repeat(14) }])).bars[0]

    expect(bar).toEqual([
      { step: 0, lane: 'ride', level: 'accent', bell: true },
      { step: 1, lane: 'ride', level: 'normal' },
    ])
  })

  it('returns notes by step, then by lane order, whatever order the lanes are written in', () => {
    const hit = 'x' + '.'.repeat(7) + 'x' + '.'.repeat(7)
    const bar = parseGroove(
      source('order', [{ ride: hit, hihat: hit, snare: hit, kick: hit }]),
    ).bars[0]

    expect(bar).toEqual([
      { step: 0, lane: 'kick', level: 'normal' },
      { step: 0, lane: 'snare', level: 'normal' },
      { step: 0, lane: 'hihat', level: 'normal' },
      { step: 0, lane: 'ride', level: 'normal' },
      { step: 8, lane: 'kick', level: 'normal' },
      { step: 8, lane: 'snare', level: 'normal' },
      { step: 8, lane: 'hihat', level: 'normal' },
      { step: 8, lane: 'ride', level: 'normal' },
    ])
  })

  it('parses the two bars of a two-bar groove independently', () => {
    const groove = parseGroove(
      source('two-bars', [
        { kick: 'X' + '.'.repeat(15) },
        { kick: '.'.repeat(8) + 'o' + '.'.repeat(7) },
      ]),
    )

    expect(groove.bars).toHaveLength(2)
    expect(groove.bars[0]).toEqual([{ step: 0, lane: 'kick', level: 'accent' }])
    expect(groove.bars[1]).toEqual([{ step: 8, lane: 'kick', level: 'ghost' }])
  })

  it('passes the metadata through unchanged', () => {
    const { bars, ...meta } = parseGroove({
      id: 'cold-sweat',
      name: 'Cold Sweat',
      after: 'Clyde Stubblefield',
      tempo: 108,
      swing: 52,
      secondaryOne: 2,
      bars: [{ kick: TIGHT.kick }],
    })

    expect(meta).toStrictEqual({
      id: 'cold-sweat',
      name: 'Cold Sweat',
      after: 'Clyde Stubblefield',
      tempo: 108,
      swing: 52,
      secondaryOne: 2,
    })
    expect(bars).toHaveLength(1)
  })

  it('leaves after and secondaryOne absent when the source does not give them', () => {
    const { bars, ...meta } = parseGroove(source('plain', [{ kick: TIGHT.kick }]))

    expect(meta).toStrictEqual({ id: 'plain', name: 'Fixture', tempo: 96, swing: 50 })
    expect(bars).toHaveLength(1)
  })
})

describe('parseGroove on a malformed grid', () => {
  it('throws on a lane of fifteen steps, naming the groove, the lane and the length', () => {
    const parse = () => parseGroove(source('alpha', [{ hihat: 'x '.repeat(15) }]))

    expect(parse).toThrow(/short-lane/)
    expect(parse).toThrow(/alpha/)
    expect(parse).toThrow(/hihat/)
    expect(parse).toThrow(/\b15\b/)
  })

  it('throws on a lane of seventeen steps, naming the groove, the lane and the length', () => {
    const parse = () => parseGroove(source('beta', [{ snare: 'x '.repeat(17) }]))

    expect(parse).toThrow(/long-lane/)
    expect(parse).toThrow(/beta/)
    expect(parse).toThrow(/snare/)
    expect(parse).toThrow(/\b17\b/)
  })

  it('throws on an unknown character, naming the groove, the lane and the step', () => {
    const parse = () =>
      parseGroove(source('gamma', [{ hihat: 'x'.repeat(5) + 'z' + 'x'.repeat(10) }]))

    expect(parse).toThrow(/unknown-char/)
    expect(parse).toThrow(/gamma/)
    expect(parse).toThrow(/hihat/)
    expect(parse).toThrow(/\bz\b/)
    expect(parse).toThrow(/\b5\b/)
  })

  it('throws on a lowercase b on ride rather than reading it as a bell', () => {
    const parse = () =>
      parseGroove(source('delta', [{ ride: 'x'.repeat(3) + 'b' + 'x'.repeat(12) }]))

    expect(parse).toThrow(/lower-bell/)
    expect(parse).toThrow(/delta/)
    expect(parse).toThrow(/ride/)
    expect(parse).toThrow(/\b3\b/)
  })

  it('throws on O outside the hihat lane', () => {
    const parse = () =>
      parseGroove(source('epsilon', [{ snare: '.'.repeat(4) + 'O' + '.'.repeat(11) }]))

    expect(parse).toThrow(/open-snare/)
    expect(parse).toThrow(/epsilon/)
    expect(parse).toThrow(/snare/)
    expect(parse).toThrow(/\b4\b/)
  })

  it('throws on B outside the ride lane', () => {
    const parse = () =>
      parseGroove(source('zeta', [{ hihat: '.'.repeat(2) + 'B' + '.'.repeat(13) }]))

    expect(parse).toThrow(/bell-hat/)
    expect(parse).toThrow(/zeta/)
    expect(parse).toThrow(/hihat/)
    expect(parse).toThrow(/\b2\b/)
  })

  it('throws on a lane name that is not a lane', () => {
    const parse = () =>
      parseGroove({
        id: 'eta',
        name: 'Fixture',
        tempo: 96,
        swing: 50,
        bars: [{ triangle: 'x'.repeat(16) }],
      } as unknown as GrooveSource)

    expect(parse).toThrow(/no-such-lane/)
    expect(parse).toThrow(/eta/)
    expect(parse).toThrow(/triangle/)
  })

  it('throws on a groove with no bars', () => {
    const parse = () => parseGroove(source('theta', []))

    expect(parse).toThrow(/no-bars/)
    expect(parse).toThrow(/theta/)
    expect(parse).toThrow(/bar/i)
  })

  it('throws on a groove of three bars', () => {
    const parse = () =>
      parseGroove(
        source('iota', [
          { kick: TIGHT.kick },
          { kick: TIGHT.kick },
          { kick: TIGHT.kick },
        ]),
      )

    expect(parse).toThrow(/too-many-bars/)
    expect(parse).toThrow(/iota/)
    expect(parse).toThrow(/\b3\b/)
  })
})
