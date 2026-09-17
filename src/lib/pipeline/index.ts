import { baseBeat } from './stages/baseBeat'
import { globalTime } from './stages/globalTime'
import type { Stage } from './types'

export type { Bar, BarContext, BarTime, Note, Stage } from './types'
export { runBar } from './run'
export { variantFor } from './stages/baseBeat'

export const PIPELINE: readonly Stage[] = [globalTime, baseBeat]
