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

const alignClass = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
} as const

type RowProps = {
  gap: Space
  align?: 'start' | 'center' | 'end' | 'between'
  children: ReactNode
}

export function Row({ gap, align = 'start', children }: RowProps) {
  return (
    <div className={`flex items-center ${alignClass[align]} ${gapClass[gap]}`}>
      {children}
    </div>
  )
}
