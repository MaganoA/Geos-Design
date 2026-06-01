import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('SpeedBarraLavaggio Panel', () => {
  afterEach(cleanup)

  it('shows the wash bar off by default', () => {
    useMachineStore.getState().setDevice('speed-barra-lavaggio', initialState)
    render(<Panel />)
    expect(screen.getByText('Barra di lavaggio')).toBeInTheDocument()
    expect(screen.getByText('Spenta')).toBeInTheDocument()
  })

  it('reflects an active wash bar', () => {
    useMachineStore.getState().setDevice('speed-barra-lavaggio', {
      ...initialState,
      accese: true,
      status: 'active',
    })
    render(<Panel />)
    expect(screen.getByText('Accesa')).toBeInTheDocument()
  })
})
