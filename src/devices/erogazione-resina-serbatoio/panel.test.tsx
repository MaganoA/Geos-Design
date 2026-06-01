import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('ErogazioneResinaSerbatoio Panel', () => {
  it('renders serbatoio and livello sections', () => {
    useMachineStore
      .getState()
      .setDevice('erogazione-resina-serbatoio', initialState)
    render(<Panel />)
    expect(screen.getByText('Serbatoio')).toBeInTheDocument()
    expect(screen.getByText('Livello resina')).toBeInTheDocument()
    expect(screen.getByText('Limite minimo')).toBeInTheDocument()
    expect(screen.getByText('72%')).toBeInTheDocument()
    expect(screen.getByText('15%')).toBeInTheDocument()
  })
})
