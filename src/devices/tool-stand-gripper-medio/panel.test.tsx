import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('ToolStandGripperumedio Panel', () => {
  afterEach(cleanup)

  it('shows stato, apertura dx/dy, and 4 valve cells', () => {
    useMachineStore
      .getState()
      .setDevice('tool-stand-gripper-medio', initialState)
    render(<Panel />)
    expect(screen.getByText('Stato')).toBeInTheDocument()
    expect(screen.getByText('A magazzino')).toBeInTheDocument()
    // Both dx and dy default to 60 → two matches.
    expect(screen.getAllByText('90 mm')).toHaveLength(2)
    expect(screen.getAllByRole('switch')).toHaveLength(4)
  })

  it('tapping a valve toggles its attiva flag', () => {
    useMachineStore
      .getState()
      .setDevice('tool-stand-gripper-medio', initialState)
    render(<Panel />)
    const cells = screen.getAllByRole('switch')
    fireEvent.click(cells[2]!)
    const after = useMachineStore.getState().devices[
      'tool-stand-gripper-medio'
    ] as typeof initialState
    expect(after.ventose[2]!.attiva).toBe(true)
  })
})
