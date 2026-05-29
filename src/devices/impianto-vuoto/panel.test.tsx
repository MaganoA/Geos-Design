import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('ImpiantoVuoto Panel', () => {
  afterEach(cleanup)

  it('shows master + both pumps off by default', () => {
    useMachineStore.getState().setDevice('impianto-vuoto', initialState)
    render(<Panel />)
    expect(screen.getByText('Impianto del vuoto')).toBeInTheDocument()
    expect(screen.getByText('Sistema')).toBeInTheDocument()
    expect(screen.getByText('Pompa 1')).toBeInTheDocument()
    expect(screen.getByText('Pompa 2')).toBeInTheDocument()
    const spente = screen.getAllByText('Spento')
    expect(spente.length).toBeGreaterThanOrEqual(3)
  })

  it('reflects master on + pump 1 active', () => {
    useMachineStore.getState().setDevice('impianto-vuoto', {
      ...initialState,
      accese: true,
      pompa1Attiva: true,
      status: 'active',
    })
    render(<Panel />)
    expect(screen.getAllByText('Acceso').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Attiva').length).toBeGreaterThanOrEqual(1)
  })
})
