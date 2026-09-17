import type { Bar, BarContext, Stage } from './types'

export function runBar(
  stages: readonly Stage[],
  index: number,
  ctx: BarContext,
): Bar {
  const seed: Bar = { index, time: null, notes: [] }
  return stages.reduce<Bar>((bar, stage) => stage(bar, ctx), seed)
}
