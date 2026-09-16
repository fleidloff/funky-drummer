type DragArgs = {
  start: number
  deltaPx: number
  min: number
  max: number
  step: number
  travelPx: number
}

export function dragValue({ start, deltaPx, min, max, step, travelPx }: DragArgs): number {
  const moved = start + (deltaPx / travelPx) * (max - min)
  const clamped = Math.min(max, Math.max(min, moved))
  const snapped = min + Math.round((clamped - min) / step) * step

  return Number(Math.min(max, Math.max(min, snapped)).toPrecision(12))
}
