export const STRAIGHT_PERCENT = 50

export const BEATS_PER_BAR = 4
export const STEPS_PER_BEAT = 4

export function secondsPerBeat(tempo: number): number {
  return 60 / tempo
}

export function barSeconds(tempo: number): number {
  return BEATS_PER_BAR * secondsPerBeat(tempo)
}

export function stepBeats(step: number, swingPercent: number): number {
  void swingPercent
  return step / STEPS_PER_BEAT
}

export function noteTime(
  startTime: number,
  secondsPerBeat: number,
  step: number,
  offsetBeats: number,
  swingPercent: number,
): number {
  return startTime + (stepBeats(step, swingPercent) + offsetBeats) * secondsPerBeat
}
