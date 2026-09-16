import type { ReactNode } from 'react'
import type { Space } from '@/components/tokens'

const padClass: Record<Space, string> = {
  0: 'p-0',
  1: 'p-1',
  2: 'p-2',
  3: 'p-3',
  4: 'p-4',
  6: 'p-6',
  8: 'p-8',
}

type InsetProps = {
  pad: Space
  children: ReactNode
}

export function Inset({ pad, children }: InsetProps) {
  return <div className={padClass[pad]}>{children}</div>
}
