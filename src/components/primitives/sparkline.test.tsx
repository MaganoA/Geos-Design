import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { Sparkline } from './sparkline'

describe('Sparkline', () => {
  afterEach(cleanup)

  it('renders an empty placeholder when values are empty', () => {
    const { container } = render(<Sparkline values={[]} height={64} />)
    // Empty data → no polyline, just the sized placeholder.
    expect(container.querySelector('polyline')).toBeNull()
    expect(container.querySelector('circle')).toBeNull()
  })

  it('renders a polyline with one point per value', () => {
    const { container } = render(
      <Sparkline values={[10, 20, 15, 25]} height={64} />,
    )
    const poly = container.querySelector('polyline')
    expect(poly).not.toBeNull()
    const ptsAttr = poly!.getAttribute('points') ?? ''
    const points = ptsAttr.trim().split(/\s+/)
    expect(points).toHaveLength(4)
  })

  it('renders a latest-point dot at the rightmost x', () => {
    const { container } = render(
      <Sparkline values={[10, 20, 30]} height={64} />,
    )
    const dot = container.querySelector('circle')
    expect(dot).not.toBeNull()
    // Last point in a 3-value sparkline lands at x = 100 (viewBox right).
    expect(Number(dot!.getAttribute('cx'))).toBeCloseTo(100, 0)
  })

  it('respects an explicit min/max range', () => {
    const { container } = render(
      <Sparkline values={[0, 50, 100]} min={0} max={100} height={100} />,
    )
    const ptsAttr = container.querySelector('polyline')!.getAttribute('points')!
    const ys = ptsAttr
      .trim()
      .split(/\s+/)
      .map((p) => Number(p.split(',')[1]))
    // First point at value 0 → near the bottom of the chart (largest y).
    // Last point at value 100 → near the top (smallest y).
    expect(ys[0]).toBeGreaterThan(ys[2]!)
  })
})
