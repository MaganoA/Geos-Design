import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type ToolStandGripperugrandeState } from './state'
import { commands } from './commands'

const ctx: CommandCtx = {
  deviceId: 'tool-stand-gripper-grande',
  role: 'superadmin',
  mode: 'manuale',
}

function run(id: string, value?: number) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler({ ...ctx, value })
}

function read(): ToolStandGripperugrandeState {
  return useMachineStore.getState().devices[
    'tool-stand-gripper-grande'
  ] as ToolStandGripperugrandeState
}

describe('tool-stand-gripper-grande commands', () => {
  beforeEach(() => {
    useMachineStore
      .getState()
      .setDevice('tool-stand-gripper-grande', initialState)
  })

  it('modifica-dx writes the new dx value', () => {
    run('tool-stand-gripper-grande.modifica-dx', 80)
    expect(read().dx).toBe(80)
  })

  it('modifica-dy writes the new dy value', () => {
    run('tool-stand-gripper-grande.modifica-dy', 65)
    expect(read().dy).toBe(65)
  })

  it('both apertura commands are superadmin-only, manual', () => {
    for (const id of [
      'tool-stand-gripper-grande.modifica-dx',
      'tool-stand-gripper-grande.modifica-dy',
    ]) {
      const c = commands.find((x) => x.id === id)
      expect(c?.requiredRole).toBe('superadmin')
      expect(c?.manualOnly).toBe(true)
      expect(c?.requiresValueInput).toBeTruthy()
    }
  })
})
