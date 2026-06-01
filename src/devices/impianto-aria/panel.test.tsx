import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('ImpiantoAria Panel', () => {
  afterEach(cleanup)

  it('renders the air system off by default', () => {
    useMachineStore.getState().setDevice('impianto-aria', initialState)
    render(<Panel />)
    expect(screen.getByText('Impianto aria')).toBeInTheDocument()
    expect(screen.getByText('Spento')).toBeInTheDocument()
  })

  it('reflects the air system on', () => {
    useMachineStore.getState().setDevice('impianto-aria', {
      ...initialState,
      accese: true,
      status: 'active',
    })
    render(<Panel />)
    expect(screen.getByText('Acceso')).toBeInTheDocument()
  })
})
