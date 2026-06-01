import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { AngleDial } from './angle-dial'

describe('AngleDial', () => {
  afterEach(cleanup)

  it('renders the angle value with one decimal and a degree sign', () => {
    render(<AngleDial value={45.3} label="Asse C" />)
    expect(screen.getByText('45.3°')).toBeInTheDocument()
    expect(screen.getByText('Asse C')).toBeInTheDocument()
  })

  it('preserves negative angles in the readout', () => {
    render(<AngleDial value={-90} label="J1" />)
    expect(screen.getByText('-90.0°')).toBeInTheDocument()
  })

  it('rounds 0.0 cleanly without a sign flip', () => {
    render(<AngleDial value={0} label="J2" />)
    expect(screen.getByText('0.0°')).toBeInTheDocument()
  })

  it('exposes a meter role for assistive tech', () => {
    render(<AngleDial value={120} label="Ralla" />)
    const meter = screen.getByRole('meter', { name: 'Ralla' })
    expect(meter).toBeInTheDocument()
    // aria-valuenow uses the wrapped 0–360 angle so screen readers get
    // a stable bounded number.
    expect(meter).toHaveAttribute('aria-valuenow', '120')
    expect(meter).toHaveAttribute('aria-valuemin', '0')
    expect(meter).toHaveAttribute('aria-valuemax', '360')
  })

  it('wraps negative angles into 0–360 for aria-valuenow', () => {
    render(<AngleDial value={-90} label="J1" />)
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '270')
  })
})
