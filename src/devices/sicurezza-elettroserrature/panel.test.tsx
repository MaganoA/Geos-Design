import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('SicurezzaElettroserrature Panel', () => {
  afterEach(cleanup)

  it('renders the codice stato row', () => {
    useMachineStore
      .getState()
      .setDevice('sicurezza-elettroserrature', initialState)
    render(<Panel />)
    expect(screen.getByText('Elettroserrature')).toBeInTheDocument()
    expect(screen.getByText('Codice')).toBeInTheDocument()
    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('lists active error codes when present', () => {
    useMachineStore.getState().setDevice('sicurezza-elettroserrature', {
      ...initialState,
      codiceStato: 'FAULT',
      codiceErrori: ['LOCK-1', 'LOCK-3'],
      status: 'error',
    })
    render(<Panel />)
    expect(screen.getByText('Errori')).toBeInTheDocument()
    expect(screen.getByText('LOCK-1, LOCK-3')).toBeInTheDocument()
  })
})
