import type { ReactNode } from 'react'
import type { Columns, Space } from '@/components/tokens'

const gapClass: Record<Space, string> = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8',
}

const columnsClass: Record<Columns, string> = {
  2: 'grid-cols-2',
  4: 'grid-cols-4',
}

type GridProps = {
  columns: Columns
  gap: Space
  children: ReactNode
}

export function Grid({ columns, gap, children }: GridProps) {
  return (
    <div className={`grid ${columnsClass[columns]} ${gapClass[gap]}`}>
      {children}
    </div>
  )
}
