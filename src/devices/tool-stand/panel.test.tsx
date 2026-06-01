import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('ToolStand Panel', () => {
  afterEach(cleanup)

  it('renders the magazzino label when no gripper is mounted', () => {
    useMachineStore.getState().setDevice('tool-stand', initialState)
    render(<Panel />)
    expect(screen.getByText('Tool stand')).toBeInTheDocument()
    expect(screen.getByText('Gripper montato')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows the mounted gripper label when one is in use', () => {
    useMachineStore.getState().setDevice('tool-stand', {
      ...initialState,
      gripperMontato: 'medio',
      status: 'active',
    })
    render(<Panel />)
    expect(screen.getByText('Medio')).toBeInTheDocument()
  })
})
