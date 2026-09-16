import type { ReactNode } from 'react'
import type { Space } from '@/components/tokens'

const gapClass: Record<Space, string> = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8',
}

type StackProps = {
  gap: Space
  children: ReactNode
}

export function Stack({ gap, children }: StackProps) {
  return <div className={`flex flex-col ${gapClass[gap]}`}>{children}</div>
}
