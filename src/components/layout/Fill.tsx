import type { ReactNode } from 'react'

type FillProps = {
  children: ReactNode
}

export function Fill({ children }: FillProps) {
  return <div className="flex min-w-0 grow *:grow">{children}</div>
}
