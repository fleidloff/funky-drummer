import { baseBeat } from './stages/baseBeat'
import { globalTime } from './stages/globalTime'
import { humanize } from './stages/humanize'
import { velocity } from './stages/velocity'
import type { Stage } from './types'

export type { Bar, BarContext, BarTime, Note, Stage } from './types'
export { runBar } from './run'
export { variantFor } from './stages/baseBeat'
export { CLAMP_BEATS } from './stages/humanize'

export const PIPELINE: readonly Stage[] = [
  globalTime,
  baseBeat,
  velocity,
  humanize,
]
