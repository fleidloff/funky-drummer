import type { ReactNode } from 'react'

type ReadoutProps = {
  children: ReactNode
}

export function Readout({ children }: ReadoutProps) {
  return (
    <span className="etched font-panel text-base leading-none font-medium tabular-nums">
      {children}
    </span>
  )
}
