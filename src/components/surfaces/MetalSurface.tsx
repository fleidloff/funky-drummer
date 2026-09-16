import type { ReactNode } from 'react'
import type { Radius } from '@/components/tokens'

const radiusClass: Record<Radius, string> = {
  panel: 'rounded-panel',
  control: 'rounded-control',
}

type MetalSurfaceProps = {
  radius: Radius
  children: ReactNode
}

export function MetalSurface({ radius, children }: MetalSurfaceProps) {
  return <div className={`surface-metal relative ${radiusClass[radius]}`}>{children}</div>
}
