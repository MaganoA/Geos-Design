import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { TimeSeriesRow } from './time-series-row'

describe('TimeSeriesRow', () => {
  afterEach(cleanup)

  it('renders the label and the current value with its unit', () => {
    render(
      <TimeSeriesRow
        label="Velocità relazionale"
        value={248}
        unit="mm/s"
      />,
    )
    expect(screen.getByText('Velocità relazionale')).toBeInTheDocument()
    expect(screen.getByText('248 mm/s')).toBeInTheDocument()
  })

  it('renders a sparkline svg after the initial mount', () => {
    const { container } = render(
      <TimeSeriesRow label="Vel" value={250} unit="mm/s" />,
    )
    // The first effect tick seeds the history with the current sample,
    // so by the time React commits there's a polyline in the DOM.
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('formats the value via the format prop when provided', () => {
    render(
      <TimeSeriesRow
        label="Vel"
        value={248.7}
        unit="mm/s"
        format={(v) => v.toFixed(1)}
      />,
    )
    expect(screen.getByText('248.7 mm/s')).toBeInTheDocument()
  })
})
