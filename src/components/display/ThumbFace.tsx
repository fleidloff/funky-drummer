'use client'

import { useId } from 'react'

const grips = 5

const gripOffsets = Array.from({ length: grips }, (_, index) => 12 + index * 6)

export function ThumbFace() {
  const id = useId()
  const body = `${id}-body`
  const face = `${id}-face`

  return (
    <svg
      data-part="thumb-face"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 48 64"
      preserveAspectRatio="none"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id={body} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-steel-bottom)" />
          <stop offset="18%" stopColor="var(--color-steel-top)" />
          <stop offset="54%" stopColor="var(--color-steel-bottom)" stopOpacity="0.6" />
          <stop offset="82%" stopColor="var(--color-steel-top)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--color-steel-bottom)" />
        </linearGradient>

        <linearGradient id={face} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
        </linearGradient>
      </defs>

      <rect x="1" y="1" width="46" height="62" rx="6" fill={`url(#${body})`} />
      <rect x="1" y="1" width="46" height="62" rx="6" fill={`url(#${face})`} />
      <rect
        x="1"
        y="1"
        width="46"
        height="62"
        rx="6"
        fill="none"
        stroke="rgba(0,0,0,0.55)"
        strokeWidth="1.5"
      />

      <g strokeWidth="2" strokeLinecap="round">
        {gripOffsets.map((offset) => (
          <g key={offset}>
            <line data-part="grip" x1={offset} y1="20" x2={offset} y2="44" stroke="rgba(0,0,0,0.42)" />
            <line x1={offset + 2} y1="20" x2={offset + 2} y2="44" stroke="rgba(255,255,255,0.4)" />
          </g>
        ))}
      </g>
    </svg>
  )
}
