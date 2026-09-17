import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { Voice } from '@/lib/kit/voices'
import { panel } from '@/lib/snippets'
import { Panel } from './Panel'
import { feelReadout, swingReadout, tempoReadout } from '../lib/format'
import { feel, swing, tempo } from '../lib/ranges'
import { voiceOrder } from '../lib/voices'
import type { PanelControls, PanelState } from '../types'

const pad = (label: string) => screen.getByRole('button', { name: label })
const slider = (label: string) => screen.getByRole('slider', { name: label })

const allPlaying = () =>
  Object.fromEntries(voiceOrder.map((voice) => [voice, true])) as Record<Voice, boolean>

const resting = (): PanelState => ({
  playing: false,
  autoFill: false,
  autoFeel: false,
  tempo: tempo.initial,
  swing: swing.initial,
  feel: feel.initial,
  voices: allPlaying(),
})

const spies = (state: PanelState): PanelControls => ({
  state,
  togglePlaying: vi.fn(),
  toggleAutoFill: vi.fn(),
  toggleAutoFeel: vi.fn(),
  setTempo: vi.fn(),
  setSwing: vi.fn(),
  setFeel: vi.fn(),
  toggleVoice: vi.fn(),
})

function Controlled() {
  const [state, setState] = useState<PanelState>(resting)

  return (
    <Panel
      state={state}
      togglePlaying={() => setState((it) => ({ ...it, playing: !it.playing }))}
      toggleAutoFill={() => setState((it) => ({ ...it, autoFill: !it.autoFill }))}
      toggleAutoFeel={() => setState((it) => ({ ...it, autoFeel: !it.autoFeel }))}
      setTempo={(value) => setState((it) => ({ ...it, tempo: value }))}
      setSwing={(value) => setState((it) => ({ ...it, swing: value }))}
      setFeel={(value) => setState((it) => ({ ...it, feel: value }))}
      toggleVoice={(voice) =>
        setState((it) => ({ ...it, voices: { ...it.voices, [voice]: !it.voices[voice] } }))
      }
    />
  )
}

describe('the pads', () => {
  it('starts with all eight instruments playing', () => {
    render(<Controlled />)

    const labels = [
      panel.kick,
      panel.snare,
      panel.hiHat,
      panel.ride,
      panel.cowbell,
      panel.shaker,
      panel.toms,
      panel.crash,
    ]

    expect(labels).toHaveLength(8)
    labels.forEach((label) => expect(pad(label)).toHaveAttribute('aria-pressed', 'true'))
  })

  it('mutes the one that is tapped and leaves the rest playing', () => {
    render(<Controlled />)

    fireEvent.click(pad(panel.hiHat))

    expect(pad(panel.hiHat)).toHaveAttribute('aria-pressed', 'false')
    expect(pad(panel.kick)).toHaveAttribute('aria-pressed', 'true')
  })

  it('brings a muted instrument back on a second tap', () => {
    render(<Controlled />)

    fireEvent.click(pad(panel.crash))
    fireEvent.click(pad(panel.crash))

    expect(pad(panel.crash)).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('the transport', () => {
  it('reads as the starting label until it is pressed', () => {
    render(<Controlled />)

    expect(pad(panel.play)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: panel.stop })).not.toBeInTheDocument()
  })

  it('swaps its label once it is running', () => {
    render(<Controlled />)

    fireEvent.click(pad(panel.play))

    expect(pad(panel.stop)).toBeInTheDocument()
  })

  it('swaps back on a second press', () => {
    render(<Controlled />)

    fireEvent.click(pad(panel.play))
    fireEvent.click(pad(panel.stop))

    expect(pad(panel.play)).toBeInTheDocument()
  })

  it('latches auto fill and auto feel independently', () => {
    render(<Controlled />)

    expect(pad(panel.autoFill)).toHaveAttribute('aria-pressed', 'false')
    expect(pad(panel.autoFeel)).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(pad(panel.autoFill))

    expect(pad(panel.autoFill)).toHaveAttribute('aria-pressed', 'true')
    expect(pad(panel.autoFeel)).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(pad(panel.autoFeel))

    expect(pad(panel.autoFeel)).toHaveAttribute('aria-pressed', 'true')
    expect(pad(panel.autoFill)).toHaveAttribute('aria-pressed', 'true')
  })

  it('reports itself unpressed while stopped, though its lamp stays on', () => {
    render(<Controlled />)

    expect(pad(panel.play)).toHaveAttribute('aria-pressed', 'false')
    expect(pad(panel.play)).toHaveClass('lamp-green')

    fireEvent.click(pad(panel.play))

    expect(pad(panel.stop)).toHaveAttribute('aria-pressed', 'true')
  })

  it('pulses while it is running and sits steady while it is not', () => {
    render(<Controlled />)

    expect(pad(panel.play)).not.toHaveClass('lamp-pulsing')

    fireEvent.click(pad(panel.play))

    expect(pad(panel.stop)).toHaveClass('lamp-pulsing')
  })

  it('gives tap tempo no latched state, because it latches no value', () => {
    render(<Controlled />)

    expect(pad(panel.tapTempo)).not.toHaveAttribute('aria-pressed')
  })

  it('flashes tap tempo while the finger is down', () => {
    render(<Controlled />)

    expect(pad(panel.tapTempo)).not.toHaveClass('brightness-125')

    fireEvent.pointerDown(pad(panel.tapTempo))

    expect(pad(panel.tapTempo)).toHaveClass('button-steel', 'brightness-125')

    fireEvent.pointerUp(pad(panel.tapTempo))

    expect(pad(panel.tapTempo)).not.toHaveClass('brightness-125')
  })
})

describe('the continuous controls', () => {
  it('rests where the music document puts them', () => {
    render(<Controlled />)

    expect(slider(panel.swing)).toHaveAttribute('aria-valuenow', String(swing.initial))
    expect(slider(panel.tempo)).toHaveAttribute('aria-valuenow', String(tempo.initial))
    expect(slider(panel.feel)).toHaveAttribute('aria-valuenow', String(feel.initial))
  })

  it('reads out the value each one is resting on', () => {
    render(<Controlled />)

    expect(slider(panel.swing)).toHaveAttribute('aria-valuetext', swingReadout(swing.initial))
    expect(slider(panel.tempo)).toHaveAttribute('aria-valuetext', tempoReadout(tempo.initial))
    expect(slider(panel.feel)).toHaveAttribute('aria-valuetext', feelReadout(feel.initial))
  })

  it('sweeps the range the music document allows', () => {
    render(<Controlled />)

    expect(slider(panel.tempo)).toHaveAttribute('aria-valuemin', String(tempo.min))
    expect(slider(panel.tempo)).toHaveAttribute('aria-valuemax', String(tempo.max))
  })

  it('counts one step up on an arrow key', () => {
    render(<Controlled />)

    fireEvent.keyDown(slider(panel.tempo), { key: 'ArrowUp' })

    expect(slider(panel.tempo)).toHaveAttribute(
      'aria-valuenow',
      String(tempo.initial + tempo.step),
    )
  })

  it('counts one step down on an arrow key', () => {
    render(<Controlled />)

    fireEvent.keyDown(slider(panel.tempo), { key: 'ArrowDown' })

    expect(slider(panel.tempo)).toHaveAttribute(
      'aria-valuenow',
      String(tempo.initial - tempo.step),
    )
  })

  it('stops at the top of its range', () => {
    render(<Controlled />)

    fireEvent.keyDown(slider(panel.feel), { key: 'End' })
    fireEvent.keyDown(slider(panel.feel), { key: 'ArrowUp' })

    expect(slider(panel.feel)).toHaveAttribute('aria-valuenow', String(feel.max))
  })
})

describe('the panel as a whole', () => {
  it('offers the eight pads and four buttons the mockup draws, and no other control', () => {
    render(<Controlled />)

    expect(screen.getAllByRole('button')).toHaveLength(12)
    expect(screen.getAllByRole('slider')).toHaveLength(3)
    expect(screen.queryAllByRole('textbox')).toEqual([])
  })

  it('puts the steering above the playing surface, in one document order', () => {
    const { container } = render(<Controlled />)

    const named = [...container.querySelectorAll('button, [role="slider"]')].map(
      (control) => control.getAttribute('aria-label') ?? control.textContent,
    )

    expect(named).toEqual([
      panel.swing,
      panel.tempo,
      panel.play,
      panel.tapTempo,
      panel.autoFill,
      panel.kick,
      panel.snare,
      panel.hiHat,
      panel.ride,
      panel.cowbell,
      panel.shaker,
      panel.toms,
      panel.crash,
      panel.feel,
      panel.autoFeel,
    ])
  })

  it('renders one identical panel whichever colour scheme the browser reports', () => {
    const renderUnder = (dark: boolean) => {
      vi.stubGlobal('matchMedia', (query: string) => ({
        matches: dark && query.includes('dark'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
      const { container, unmount } = render(<Controlled />)
      // useId numbers each render root, so the SVG gradient names differ
      // between two renders for reasons that have nothing to do with the scheme.
      const html = container.innerHTML
        .replace(/ id="[^"]*"/g, ' id="x"')
        .replace(/url\(#[^)]*\)/g, 'url(#x)')
      unmount()
      vi.unstubAllGlobals()
      return html
    }

    // jsdom applies no stylesheet, so this cannot see the colours. What it does
    // prove is that nothing branches on the scheme at runtime — the swap is
    // wholly in globals.css, which src/app/theme.test.ts checks from disk.
    expect(renderUnder(true)).toBe(renderUnder(false))
  })

  it('names every control for a screen reader', () => {
    render(<Controlled />)

    const unnamed = [...screen.getAllByRole('button'), ...screen.getAllByRole('slider')].filter(
      (control) => (control.getAttribute('aria-label') ?? control.textContent ?? '') === '',
    )

    expect(unnamed).toEqual([])
  })
})

describe('the panel is driven by its props', () => {
  it('shows the state it is handed, with nothing tapped', () => {
    render(<Panel {...spies({ ...resting(), playing: true, voices: { ...allPlaying(), hihat: false } })} />)

    expect(pad(panel.stop)).toHaveAttribute('aria-pressed', 'true')
    expect(pad(panel.hiHat)).toHaveAttribute('aria-pressed', 'false')
    expect(pad(panel.kick)).toHaveAttribute('aria-pressed', 'true')
  })

  it('reports a tap to the callback it was given and changes nothing itself', () => {
    const controls = spies(resting())
    render(<Panel {...controls} />)

    fireEvent.click(pad(panel.hiHat))
    fireEvent.click(pad(panel.play))

    expect(controls.toggleVoice).toHaveBeenCalledWith('hihat')
    expect(controls.togglePlaying).toHaveBeenCalledTimes(1)
    expect(pad(panel.hiHat)).toHaveAttribute('aria-pressed', 'true')
    expect(pad(panel.play)).toBeInTheDocument()
  })
})
