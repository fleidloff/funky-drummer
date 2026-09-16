'use client'

import { useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { Tone } from '@/components/tokens'
import { buttonShape, lampClass } from './BacklitButton'

const activationKeys = [' ', 'Enter']

type MomentaryButtonProps = {
  label: string
  tone: Tone
  onPress: () => void
}

export function MomentaryButton({ label, tone, onPress }: MomentaryButtonProps) {
  const [held, setHeld] = useState(false)

  const press = () => {
    setHeld(true)
    onPress()
  }

  const release = () => setHeld(false)

  const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (!activationKeys.includes(event.key) || event.repeat) return
    event.preventDefault()
    press()
  }

  const onKeyUp = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (activationKeys.includes(event.key)) release()
  }

  return (
    <button
      type="button"
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onBlur={release}
      className={`${buttonShape} ${held ? lampClass[tone].lit : lampClass[tone].unlit}`}
    >
      {label}
    </button>
  )
}
