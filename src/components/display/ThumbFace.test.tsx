import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThumbFace } from './ThumbFace'

const face = (container: HTMLElement) =>
  container.querySelector('[data-part="thumb-face"]') as SVGElement

describe('ThumbFace', () => {
  it('is decoration, so it stays out of the accessibility tree', () => {
    const { container } = render(<ThumbFace />)

    expect(face(container)).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryAllByRole('img')).toEqual([])
  })

  it('carries the grip ridges that make it read as a thumb', () => {
    const { container } = render(<ThumbFace />)

    expect(container.querySelectorAll('[data-part="grip"]')).toHaveLength(5)
  })

  it('stretches to the box it is given rather than keeping its own ratio', () => {
    const { container } = render(<ThumbFace />)

    expect(face(container)).toHaveAttribute('preserveAspectRatio', 'none')
  })

  it('gives every instance its own gradient names', () => {
    const { container } = render(
      <>
        <ThumbFace />
        <ThumbFace />
      </>,
    )

    const ids = [...container.querySelectorAll('[id]')].map((node) => node.id)

    expect(ids.length).toBeGreaterThan(1)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
