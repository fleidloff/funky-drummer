export function tempoReadout(bpm: number): string {
  return `${Math.round(bpm)} BPM`
}

export function swingReadout(percent: number): string {
  return `${Number(percent.toFixed(1))}%`
}

export function feelReadout(fraction: number): string {
  return `${Math.round(fraction * 100)}%`
}

export function scaleMark(value: number): string {
  return `${Math.round(value)}`
}
