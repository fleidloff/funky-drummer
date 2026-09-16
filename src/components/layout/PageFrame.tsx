import type { ReactNode } from 'react'

type PageFrameProps = {
  children: ReactNode
}

export function PageFrame({ children }: PageFrameProps) {
  return (
    <div
      className="min-h-dvh w-full bg-bezel flex items-center justify-center pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]"
    >
      <div className="w-full max-w-[26rem] md:max-w-4xl flex flex-col">{children}</div>
    </div>
  )
}
