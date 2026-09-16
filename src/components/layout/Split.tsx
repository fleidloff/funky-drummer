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

type SplitProps = {
  gap: Space
  start: ReactNode
  end: ReactNode
}

export function Split({ gap, start, end }: SplitProps) {
  return (
    <div className={`flex flex-col md:flex-row ${gapClass[gap]}`}>
      <div className="md:flex-1">{start}</div>
      <div className="md:flex-1">{end}</div>
    </div>
  )
}
