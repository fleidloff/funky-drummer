import { describe, expect, it } from 'vitest'
import { feelReadout, scaleMark, swingReadout, tempoReadout } from './format'
import { feel, swing, tempo } from './ranges'

describe('the readouts', () => {
  it('writes a tempo in whole beats per minute', () => {
    expect(tempoReadout(96)).toBe('96 BPM')
    expect(tempoReadout(96.4)).toBe('96 BPM')
  })

  it('writes a swing to a tenth of a percent, dropping a trailing zero', () => {
    expect(swingReadout(54)).toBe('54%')
    expect(swingReadout(56.5)).toBe('56.5%')
    expect(swingReadout(66.7)).toBe('66.7%')
  })

  it('writes a feel as a whole percentage of its 0-1 range', () => {
    expect(feelReadout(0)).toBe('0%')
    expect(feelReadout(0.5)).toBe('50%')
    expect(feelReadout(1)).toBe('100%')
  })

  it('writes a scale mark as a whole number', () => {
    expect(scaleMark(66.7)).toBe('67')
    expect(scaleMark(180)).toBe('180')
  })
})

describe('the ranges', () => {
  it('takes tempo from the music document: 60-180, resting at 96', () => {
    expect([tempo.min, tempo.max, tempo.initial]).toEqual([60, 180, 96])
  })

  it('takes swing from the music document: 50-66.7, resting at 54', () => {
    expect([swing.min, swing.max, swing.initial]).toEqual([50, 66.7, 54])
  })

  it('takes feel from the music document: 0-1, resting at 0.5', () => {
    expect([feel.min, feel.max, feel.initial]).toEqual([0, 1, 0.5])
  })
})
