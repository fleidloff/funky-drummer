import type { ReactNode } from 'react'

type WellProps = {
  children: ReactNode
}

export function Well({ children }: WellProps) {
  return <div className="surface-well rounded-control">{children}</div>
}
