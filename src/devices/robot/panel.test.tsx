import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useMachineStore } from '@/store/machine-store'
import { initialState as robotInitial } from './state'
import { initialState as toolStandInitial } from '../tool-stand/state'
import { Panel } from './panel'

// GripperSection consumes useSearchParams via useSelectedDevice, so
// Panel renders need a router in scope.
function renderPanel() {
  return render(
    <MemoryRouter>
      <Panel />
    </MemoryRouter>,
  )
}

describe('Robot Panel', () => {
  afterEach(cleanup)

  it('renders all 6 joint angles as dials and the linear distance', () => {
    useMachineStore.getState().setDevice('robot', {
      ...robotInitial,
      angoli: [10, 20, 30, 40, 50, 60],
      distanza: 750,
    })
    useMachineStore.getState().setDevice('tool-stand', toolStandInitial)
    renderPanel()
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

  it('shows the Preleva Gripper CTA when no gripper is mounted', () => {
    useMachineStore.getState().setDevice('robot', robotInitial)
    useMachineStore.getState().setDevice('tool-stand', toolStandInitial)
    renderPanel()
    expect(
      screen.getByRole('button', { name: 'Preleva Gripper' }),
    ).toBeInTheDocument()
  })

  it('shows the mounted gripper link card when one is mounted', () => {
    useMachineStore.getState().setDevice('robot', robotInitial)
    useMachineStore.getState().setDevice('tool-stand', {
      ...toolStandInitial,
      gripperMontato: 'grande',
      status: 'active',
    })
    renderPanel()
    // The link card surfaces the full "Gripper grande" label and is
    // an actionable button (navigates to the gripper's device panel).
    expect(
      screen.getByRole('button', { name: /Gripper grande/ }),
    ).toBeInTheDocument()
    // CTA must NOT be present when a gripper is already mounted.
    expect(
      screen.queryByRole('button', { name: 'Preleva Gripper' }),
    ).not.toBeInTheDocument()
  })
})
