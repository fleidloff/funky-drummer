'use client'

import { useId } from 'react'

const teeth = 44
const grainRings = 52

type KnobFaceProps = {
  angle: number
}

const toothAngles = Array.from({ length: teeth }, (_, index) => (index * 360) / teeth)

// Turned metal: the rings tighten and strengthen outward, and fade to nothing
// at the centre, where a lathe leaves no travel.
const grainStops = Array.from({ length: grainRings }, (_, index) => {
  const position = index / (grainRings - 1)
  const alpha = (0.045 + position * 0.075).toFixed(3)
  return {
    offset: `${(0.12 + position * 0.88) * 100}%`,
    color: index % 2 === 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`,
  }
})

export function KnobFace({ angle }: KnobFaceProps) {
  const id = useId()
  const cap = `${id}-cap`
  const turning = `${id}-turning`
  const sheen = `${id}-sheen`
  const rim = `${id}-rim`
  const collar = `${id}-collar`

  return (
    <svg data-part="knob-face" aria-hidden="true" focusable="false" viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <radialGradient id={cap} cx="50%" cy="26%" r="72%">
          <stop offset="0%" stopColor="var(--color-steel-top)" />
          <stop offset="55%" stopColor="var(--color-steel-bottom)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-steel-bottom)" />
        </radialGradient>

        <radialGradient id={turning} cx="50%" cy="50%" r="50%">
          {grainStops.map((stop) => (
            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </radialGradient>

        <linearGradient id={sheen} x1="12%" y1="0%" x2="88%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="34%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="52%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.28)" />
        </linearGradient>

        <linearGradient id={rim} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
        </linearGradient>

        <linearGradient id={collar} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.35)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.9)" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="49" fill={`url(#${collar})`} />
      <g stroke="rgba(255,255,255,0.22)" strokeWidth="1.1" strokeLinecap="round">
        {toothAngles.map((tooth) => (
          <line
            key={tooth}
            data-part="tooth"
            x1="50"
            y1="3.5"
            x2="50"
            y2="9"
            transform={`rotate(${tooth} 50 50)`}
          />
        ))}
      </g>

      <circle cx="50" cy="50" r="39" fill={`url(#${cap})`} />
      <circle cx="50" cy="50" r="39" fill={`url(#${turning})`} opacity="0.55" />
      <circle cx="50" cy="50" r="39" fill={`url(#${sheen})`} />
      <circle cx="50" cy="50" r="38.4" fill="none" stroke={`url(#${rim})`} strokeWidth="1.6" />

      <g data-part="needle" transform={`rotate(${angle} 50 50)`}>
        <rect x="48.6" y="12.5" width="2.8" height="24" rx="1.4" fill="rgba(0,0,0,0.6)" />
        <rect x="49" y="13" width="1.6" height="23" rx="0.8" fill="rgba(255,255,255,0.95)" />
      </g>
    </svg>
  )
}
