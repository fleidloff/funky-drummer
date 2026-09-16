import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KnobFace } from './KnobFace'

const face = (container: HTMLElement) =>
  container.querySelector('[data-part="knob-face"]') as SVGElement

describe('KnobFace', () => {
  it('is decoration, so it stays out of the accessibility tree', () => {
    const { container } = render(<KnobFace angle={0} />)

    expect(face(container)).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryAllByRole('img')).toEqual([])
  })

  it('knurls its collar with a full ring of teeth', () => {
    const { container } = render(<KnobFace angle={0} />)

    expect(container.querySelectorAll('[data-part="tooth"]')).toHaveLength(44)
  })

  it.each([
    [-135, 'rotate(-135 50 50)'],
    [0, 'rotate(0 50 50)'],
    [135, 'rotate(135 50 50)'],
  ])('points its needle at %i degrees', (angle, expected) => {
    const { container } = render(<KnobFace angle={angle} />)

    expect(container.querySelector('[data-part="needle"]')).toHaveAttribute('transform', expected)
  })

  it('gives every instance its own gradient names, so two knobs cannot collide', () => {
    const { container } = render(
      <>
        <KnobFace angle={0} />
        <KnobFace angle={90} />
      </>,
    )

    const ids = [...container.querySelectorAll('[id]')].map((node) => node.id)

    expect(ids.length).toBeGreaterThan(1)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
