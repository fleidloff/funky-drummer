'use client'

type PadProps = {
  label: string
  lit: boolean
  onToggle: () => void
}

export function Pad({ label, lit, onToggle }: PadProps) {
  return (
    <button
      type="button"
      aria-pressed={lit}
      onClick={onToggle}
      className={`font-panel aspect-square w-full rounded-control text-[12px] leading-none font-medium uppercase tracking-[0.06em] select-none touch-none ${
        lit ? 'lamp-amber' : 'lamp-amber-off'
      }`}
    >
      {label}
    </button>
  )
}
