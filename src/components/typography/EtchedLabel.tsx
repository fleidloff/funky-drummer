import type { ReactNode } from 'react'

type EtchedLabelProps = {
  size: 'control' | 'scale'
  children: ReactNode
}

const sizeClass: Record<EtchedLabelProps['size'], string> = {
  control: 'text-sm font-medium uppercase tracking-[0.22em]',
  scale: 'text-[11px] font-normal tracking-[0.08em] opacity-80',
}

export function EtchedLabel({ size, children }: EtchedLabelProps) {
  return <span className={`etched font-panel leading-none ${sizeClass[size]}`}>{children}</span>
}
