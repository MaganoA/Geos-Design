import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('PortaleTesta1Tenuta Panel', () => {
  it('renders the Livello pressione section with gauge and modalità', () => {
    useMachineStore.getState().setDevice('portale-testa-1-tenuta', {
      ...initialState,
      livelloDepressione: 0.82,
      modalita: 'aspirazione',
    })
    render(<Panel />)
    expect(screen.getByText('Livello pressione')).toBeInTheDocument()
    expect(screen.getByText('Aspirazione')).toBeInTheDocument()
    // Pressure level surfaced both as a meter and as the gauge centre label.
    const meter = screen.getByRole('meter')
    expect(meter).toHaveAttribute('aria-valuenow', '82')
    expect(screen.getByText('82%')).toBeInTheDocument()
  })

  it('does not duplicate codice stato / errori already shown in the status badge', () => {
    useMachineStore.getState().setDevice('portale-testa-1-tenuta', initialState)
    render(<Panel />)
    expect(screen.queryByText('Codice stato')).not.toBeInTheDocument()
    expect(screen.queryByText('Codici errori')).not.toBeInTheDocument()
  })
})
