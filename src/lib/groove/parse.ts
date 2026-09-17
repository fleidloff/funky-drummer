import {
  LANES,
  STEPS_PER_BAR,
  type Bar,
  type GridNote,
  type Groove,
  type Lane,
  type Level,
} from './types'

export type GrooveSource = {
  readonly id: string
  readonly name: string
  readonly after?: string
  readonly tempo: number
  readonly swing: number
  readonly secondaryOne?: number
  readonly bars: readonly Readonly<Partial<Record<Lane, string>>>[]
}

const REST = '.'
const OPEN_HIHAT = 'O'
const RIDE_BELL = 'B'
const LOWER_BELL = 'b'

const LEVEL_OF: Readonly<Record<string, Level>> = {
  o: 'ghost',
  x: 'normal',
  X: 'accent',
  '#': 'anchor',
}

const SYMBOLS = `${REST} ${Object.keys(LEVEL_OF).join(' ')}`

const isLane = (name: string): name is Lane => (LANES as readonly string[]).includes(name)

const stripped = (steps: string) => steps.replace(/\s+/g, '')

const where = (id: string, lane: Lane, step: number) =>
  `groove "${id}", lane "${lane}", step ${step}`

const symbolError = (id: string, lane: Lane, step: number, symbol: string) => {
  if (symbol === LOWER_BELL) {
    return new Error(
      `${where(id, lane, step)}: lower-bell — the ride bell is an uppercase "${RIDE_BELL}", and a lowercase "${LOWER_BELL}" is nothing at all.`,
    )
  }
  if (symbol === OPEN_HIHAT) {
    return new Error(
      `${where(id, lane, step)}: open-snare — "${OPEN_HIHAT}" is the open hi-hat and is only valid on the hihat lane, while a ghost note anywhere is a lowercase "o".`,
    )
  }
  if (symbol === RIDE_BELL) {
    return new Error(
      `${where(id, lane, step)}: bell-hat — "${RIDE_BELL}" is the ride bell and is only valid on the ride lane.`,
    )
  }
  return new Error(
    `${where(id, lane, step)}: unknown-char — "${symbol}" is not a step symbol, so write one of ${SYMBOLS} instead.`,
  )
}

const noteAt = (id: string, lane: Lane, step: number, symbol: string): GridNote | undefined => {
  if (symbol === REST) return undefined

  const level = LEVEL_OF[symbol]
  if (level !== undefined) return { step, lane, level }

  if (symbol === OPEN_HIHAT && lane === 'hihat') {
    return { step, lane, level: 'accent', open: true }
  }
  if (symbol === RIDE_BELL && lane === 'ride') {
    return { step, lane, level: 'accent', bell: true }
  }

  throw symbolError(id, lane, step, symbol)
}

const laneError = (id: string, name: string) =>
  new Error(
    `groove "${id}": no-such-lane — "${name}" is not a lane, so write one of ${LANES.join(', ')} instead.`,
  )

const lengthError = (id: string, lane: Lane, length: number) =>
  new Error(
    `groove "${id}", lane "${lane}": ${length < STEPS_PER_BAR ? 'short-lane' : 'long-lane'} — a lane is ${STEPS_PER_BAR} steps once its whitespace is stripped, and this one is ${length}.`,
  )

const parseBar = (id: string, bar: Readonly<Partial<Record<Lane, string>>>): Bar => {
  const grid = new Map<Lane, string>()

  for (const [name, steps] of Object.entries(bar)) {
    if (steps === undefined) continue
    if (!isLane(name)) throw laneError(id, name)

    const cells = stripped(steps)
    if (cells.length !== STEPS_PER_BAR) throw lengthError(id, name, cells.length)

    grid.set(name, cells)
  }

  const notes: GridNote[] = []
  for (let step = 0; step < STEPS_PER_BAR; step += 1) {
    for (const lane of LANES) {
      const cells = grid.get(lane)
      if (cells === undefined) continue

      const note = noteAt(id, lane, step, cells.charAt(step))
      if (note !== undefined) notes.push(note)
    }
  }
  return notes
}

export function parseGroove(source: GrooveSource): Groove {
  const { id, bars } = source

  if (bars.length === 0) {
    throw new Error(`groove "${id}": no-bars — a groove is one or two bars, and this one has none.`)
  }
  if (bars.length > 2) {
    throw new Error(
      `groove "${id}": too-many-bars — a groove is one or two bars, and this one has ${bars.length}.`,
    )
  }

  return {
    id,
    name: source.name,
    ...(source.after === undefined ? {} : { after: source.after }),
    tempo: source.tempo,
    swing: source.swing,
    ...(source.secondaryOne === undefined ? {} : { secondaryOne: source.secondaryOne }),
    bars: bars.map((bar) => parseBar(id, bar)),
  }
}
