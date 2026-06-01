import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('ToolStandGripperPiccolo Panel', () => {
  afterEach(cleanup)

  it('shows stato and apertura dx/dy (valvole live in the 3D scene)', () => {
    useMachineStore
      .getState()
      .setDevice('tool-stand-gripper-piccolo', initialState)
    render(<Panel />)
    expect(screen.getByText('Stato')).toBeInTheDocument()
    expect(screen.getByText('A magazzino')).toBeInTheDocument()
    // Both dx and dy default to 60 → two matches.
    expect(screen.getAllByText('60 mm')).toHaveLength(2)
    // Valvole grid was removed from the panel — its state is now shown
    // only in the 3D viewport.
    expect(screen.queryAllByRole('switch')).toHaveLength(0)
  })
})
