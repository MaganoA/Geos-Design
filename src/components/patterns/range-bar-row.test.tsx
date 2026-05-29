import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { RangeBarRow } from './range-bar-row'

describe('RangeBarRow', () => {
  afterEach(cleanup)

  it('renders the label and the rounded value with its unit', () => {
    render(
      <RangeBarRow
        label="Velocità relazionale"
        value={248.7}
        unit="mm/s"
        min={0}
        max={500}
      />,
    )
    expect(screen.getByText('Velocità relazionale')).toBeInTheDocument()
    // Integer rounding is the default to keep the readout calm.
    expect(screen.getByText('249')).toBeInTheDocument()
    expect(screen.getByText('mm/s')).toBeInTheDocument()
  })

  it('exposes the value as a progressbar with proper aria bounds', () => {
    render(
      <RangeBarRow
        label="Vel"
        value={250}
        unit="mm/s"
        min={0}
        max={500}
      />,
    )
    const bar = screen.getByRole('progressbar', { name: 'Vel' })
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '500')
    expect(bar).toHaveAttribute('aria-valuenow', '250')
  })

  it('clamps value below min and above max', () => {
    const { rerender } = render(
      <RangeBarRow label="Vel" value={-50} unit="mm/s" min={0} max={500} />,
    )
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    rerender(<RangeBarRow label="Vel" value={9999} unit="mm/s" min={0} max={500} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '500')
  })

  it('honours a custom format prop', () => {
    render(
      <RangeBarRow
        label="Vel"
        value={248.73}
        unit="mm/s"
        min={0}
        max={500}
        format={(v) => v.toFixed(1)}
      />,
    )
    expect(screen.getByText('248.7')).toBeInTheDocument()
  })
})
