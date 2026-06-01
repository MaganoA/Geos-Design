import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('ToolStandGripperugrande Panel', () => {
  afterEach(cleanup)

  it('shows stato and apertura dx/dy (valvole live in the 3D scene)', () => {
    useMachineStore
      .getState()
      .setDevice('tool-stand-gripper-grande', initialState)
    render(<Panel />)
    expect(screen.getByText('Stato')).toBeInTheDocument()
    expect(screen.getByText('A magazzino')).toBeInTheDocument()
    expect(screen.getAllByText('120 mm')).toHaveLength(2)
    expect(screen.queryAllByRole('switch')).toHaveLength(0)
  })
})
