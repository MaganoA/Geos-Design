import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('ErogazioneResinaAlimentatoreInserti Panel', () => {
  it('renders alimentatore section with flexpin label', () => {
    useMachineStore
      .getState()
      .setDevice('erogazione-resina-alimentatore-inserti', initialState)
    render(<Panel />)
    expect(screen.getByText('Alimentatore inserti')).toBeInTheDocument()
    expect(screen.getByText('Acceso')).toBeInTheDocument()
    expect(screen.getByText('1 — Corto')).toBeInTheDocument()
  })
})
