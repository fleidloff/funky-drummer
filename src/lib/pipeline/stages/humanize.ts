import type { Voice } from '@/lib/kit/voices'
import { VOICES } from '@/lib/kit/voices'
import { gaussian, hashOf } from '@/lib/random/hash'
import type { Stage } from '../types'

export const STEP_SIGMA_BEATS = 0.0075
export const VOICE_SIGMA_BEATS = 0.003
export const CLAMP_BEATS = 0.024

const STEP_SALT_A = 0x1b873593
const STEP_SALT_B = 0xcc9e2d51
const VOICE_SALT_A = 0x27d4eb2f
const VOICE_SALT_B = 0x165667b1

export function offsetFor(
  seed: number,
  barIndex: number,
  step: number,
  voice: Voice,
): number {
  const voiceIndex = VOICES.indexOf(voice)

  const stepDraw =
    STEP_SIGMA_BEATS *
    gaussian(
      hashOf(seed, STEP_SALT_A, barIndex, step),
      hashOf(seed, STEP_SALT_B, barIndex, step),
    )

  const voiceDraw =
    VOICE_SIGMA_BEATS *
    gaussian(
      hashOf(seed, VOICE_SALT_A, barIndex, step, voiceIndex),
      hashOf(seed, VOICE_SALT_B, barIndex, step, voiceIndex),
    )

  return Math.min(CLAMP_BEATS, Math.max(-CLAMP_BEATS, stepDraw + voiceDraw))
}

export const humanize: Stage = (bar, ctx) => ({
  ...bar,
  notes: bar.notes.map((note) => ({
    ...note,
    offsetBeats: offsetFor(ctx.seed, bar.index, note.step, note.voice),
  })),
})
