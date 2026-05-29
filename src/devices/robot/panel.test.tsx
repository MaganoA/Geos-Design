import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState as robotInitial } from './state'
import { initialState as toolStandInitial } from '../tool-stand/state'
import { Panel } from './panel'

describe('Robot Panel', () => {
  afterEach(cleanup)

  it('renders all 6 joint angles as dials and the linear distance', () => {
    useMachineStore.getState().setDevice('robot', {
      ...robotInitial,
      angoli: [10, 20, 30, 40, 50, 60],
      distanza: 750,
    })
    useMachineStore.getState().setDevice('tool-stand', toolStandInitial)
    render(<Panel />)
    expect(screen.getByText('Posizione')).toBeInTheDocument()
    for (const j of ['J1', 'J2', 'J3', 'J4', 'J5', 'J6']) {
      expect(screen.getByText(j)).toBeInTheDocument()
    }
    // AngleDial shows one decimal place on the readout.
    expect(screen.getByText('10.0°')).toBeInTheDocument()
    expect(screen.getByText('60.0°')).toBeInTheDocument()
    // All six joints should be exposed as meters for assistive tech.
    expect(screen.getAllByRole('meter')).toHaveLength(6)
    expect(screen.getByText('Distanza')).toBeInTheDocument()
    expect(screen.getByText('750 mm')).toBeInTheDocument()
  })

  it('shows the mounted gripper label sourced from tool-stand', () => {
    useMachineStore.getState().setDevice('robot', robotInitial)
    useMachineStore.getState().setDevice('tool-stand', {
      ...toolStandInitial,
      gripperMontato: 'grande',
    })
    render(<Panel />)
    expect(screen.getByText('Gripper montato')).toBeInTheDocument()
    expect(screen.getByText('Grande')).toBeInTheDocument()
  })

  it('falls back to em-dash when no gripper is mounted', () => {
    useMachineStore.getState().setDevice('robot', robotInitial)
    useMachineStore.getState().setDevice('tool-stand', toolStandInitial)
    render(<Panel />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
