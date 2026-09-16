import type { ReactNode } from 'react'

type EngravedTextProps = {
  size: 'title' | 'caption'
  children: ReactNode
}

const sizeClass: Record<EngravedTextProps['size'], string> = {
  title: 'font-display block text-[2rem] uppercase leading-[0.92] tracking-[0.01em]',
  caption: 'font-panel block text-[10px] font-medium uppercase tracking-[0.28em]',
}

export function EngravedText({ size, children }: EngravedTextProps) {
  return <span className={`engraved ${sizeClass[size]}`}>{children}</span>
}
