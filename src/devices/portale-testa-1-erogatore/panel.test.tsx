import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('PortaleTesta1Erogatore Panel', () => {
  // Both cases mount a panel bound to the same store key; without an
  // explicit unmount the first stays subscribed and re-renders when the
  // second seeds new state, duplicating its text.
  afterEach(cleanup)

  it('shows spurgo and aria compressa command states; stato lives in the badge', () => {
    useMachineStore
      .getState()
      .setDevice('portale-testa-1-erogatore', initialState)
    render(<Panel />)
    expect(screen.getByText('Stato dei comandi')).toBeInTheDocument()
    expect(screen.getByText('Spurgo')).toBeInTheDocument()
    expect(screen.getByText('Aria compressa')).toBeInTheDocument()
    // Both off in initial state.
    expect(screen.getByText('Disattivo')).toBeInTheDocument()
    expect(screen.getByText('Disattiva')).toBeInTheDocument()
    // Valve stato never duplicated from the badge.
    expect(screen.queryByText('Stato')).not.toBeInTheDocument()
    expect(screen.queryByText('Chiuso')).not.toBeInTheDocument()
  })

  it('reflects both purge and compressed air running independently', () => {
    useMachineStore.getState().setDevice('portale-testa-1-erogatore', {
      ...initialState,
      stato: 'aperto',
      spurgoAttivo: true,
      ariaCompressaAttiva: true,
      status: 'warning',
    })
    render(<Panel />)
    expect(screen.getByText('Attivo')).toBeInTheDocument() // spurgo (m.)
    expect(screen.getByText('Attiva')).toBeInTheDocument() // aria compressa (f.)
  })
})
