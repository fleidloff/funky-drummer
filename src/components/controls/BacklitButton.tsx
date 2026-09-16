'use client'

import type { Tone } from '@/components/tokens'

export const lampClass: Record<Tone, { lit: string; unlit: string }> = {
  amber: { lit: 'lamp-amber', unlit: 'lamp-amber-off' },
  green: { lit: 'lamp-green', unlit: 'lamp-green-off' },
  steel: { lit: 'button-steel brightness-125', unlit: 'button-steel' },
}

export const buttonShape =
  'font-panel rounded-control px-3 py-3 text-[13px] leading-none font-medium uppercase tracking-[0.1em] select-none touch-none'

type BacklitButtonProps = {
  label: string
  tone: Tone
  lit: boolean
  pressed?: boolean
  pulsing?: boolean
  onToggle: () => void
}

export function BacklitButton({
  label,
  tone,
  lit,
  pressed,
  pulsing = false,
  onToggle,
}: BacklitButtonProps) {
  const lamp = lit ? lampClass[tone].lit : lampClass[tone].unlit
  const pulse = lit && pulsing ? ' lamp-pulsing' : ''

  return (
    <button
      type="button"
      aria-pressed={pressed ?? lit}
      onClick={onToggle}
      className={`${buttonShape} ${lamp}${pulse}`}
    >
      {label}
    </button>
  )
}
