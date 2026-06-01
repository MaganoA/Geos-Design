import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('ImpiantoAcqua Panel', () => {
  afterEach(cleanup)

  it('renders the dual stato (interna + esterna) and the master switch', () => {
    useMachineStore.getState().setDevice('impianto-acqua', initialState)
    render(<Panel />)
    expect(screen.getByText('Impianto acqua')).toBeInTheDocument()
    expect(screen.getByText('Sistema')).toBeInTheDocument()
    expect(screen.getByText('Spento')).toBeInTheDocument()
    expect(screen.getByText('Codice acqua interna')).toBeInTheDocument()
    expect(screen.getByText('Codice acqua esterna')).toBeInTheDocument()
    const ok = screen.getAllByText('OK')
    expect(ok.length).toBeGreaterThanOrEqual(2)
  })
})
