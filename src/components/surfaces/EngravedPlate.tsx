import type { ReactNode } from 'react'

type EngravedPlateProps = {
  children: ReactNode
}

export function EngravedPlate({ children }: EngravedPlateProps) {
  return (
    <div className="surface-metal rounded-panel p-1">
      <div className="surface-field rounded-control">{children}</div>
    </div>
  )
}
