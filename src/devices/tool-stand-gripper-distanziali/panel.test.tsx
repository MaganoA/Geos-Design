import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'
import { Panel } from './panel'

describe('ToolStandGripperDistanziali Panel', () => {
  afterEach(cleanup)

  it('shows apertura dx + dy (read-only, no commands)', () => {
    useMachineStore
      .getState()
      .setDevice('tool-stand-gripper-distanziali', initialState)
    render(<Panel />)
    expect(screen.getByText('Gripper dei distanziali')).toBeInTheDocument()
    expect(screen.getByText('Apertura dx')).toBeInTheDocument()
    expect(screen.getByText('Apertura dy')).toBeInTheDocument()
    expect(screen.getAllByText('50 mm').length).toBeGreaterThanOrEqual(2)
  })
})
