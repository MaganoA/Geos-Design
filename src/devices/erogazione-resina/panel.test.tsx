import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('ErogazioneResina Panel', () => {
  it('renders sistema di erogazione section', () => {
    useMachineStore.getState().setDevice('erogazione-resina', initialState)
    render(<Panel />)
    expect(screen.getByText('Sistema di erogazione')).toBeInTheDocument()
    expect(screen.getByText('ID resina')).toBeInTheDocument()
    expect(screen.getByText('RES-EPX-228')).toBeInTheDocument()
    // codiceStato + pressione both render "OK" → assert at least one
    expect(screen.getAllByText('OK').length).toBeGreaterThan(0)
  })
})
