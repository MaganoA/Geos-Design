import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('PortaleTesta2GripperPin Panel', () => {
  afterEach(cleanup)

  it('renders ganasce and angolo, hides destinazione when equal to angolo', () => {
    useMachineStore
      .getState()
      .setDevice('portale-testa-2-gripper-pin', initialState)
    render(<Panel />)
    expect(screen.getByText('Stato del gripper')).toBeInTheDocument()
    expect(screen.getByText('Ganasce')).toBeInTheDocument()
    expect(screen.getByText('Chiuso')).toBeInTheDocument()
    expect(screen.getByText('Angolo')).toBeInTheDocument()
    expect(screen.getByText('0.0°')).toBeInTheDocument()
    expect(screen.queryByText('Destinazione')).not.toBeInTheDocument()
  })

  it('shows destinazione when it differs from current angolo', () => {
    useMachineStore.getState().setDevice('portale-testa-2-gripper-pin', {
      ...initialState,
      angolo: 30,
      angoloDestinazione: 60,
    })
    render(<Panel />)
    expect(screen.getByText('Destinazione')).toBeInTheDocument()
    expect(screen.getByText('60°')).toBeInTheDocument()
  })
})
