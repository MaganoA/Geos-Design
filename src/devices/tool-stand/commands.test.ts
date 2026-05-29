import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type ToolStandState } from './state'
import { commands } from './commands'
import {
  initialState as piccoloInitial,
  type ToolStandGripperPiccoloState,
} from '../tool-stand-gripper-piccolo/state'

const ctx: CommandCtx = {
  deviceId: 'tool-stand',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler(ctx)
}

function readStand(): ToolStandState {
  return useMachineStore.getState().devices['tool-stand'] as ToolStandState
}
function readPiccolo(): ToolStandGripperPiccoloState {
  return useMachineStore.getState().devices[
    'tool-stand-gripper-piccolo'
  ] as ToolStandGripperPiccoloState
}

describe('tool-stand commands', () => {
  beforeEach(() => {
    useMachineStore.getState().setDevice('tool-stand', initialState)
    useMachineStore
      .getState()
      .setDevice('tool-stand-gripper-piccolo', piccoloInitial)
  })

  it('preleva-piccolo mounts the gripper and switches its stato away from a-magazzino', () => {
    run('tool-stand.preleva-piccolo')
    expect(readStand().gripperMontato).toBe('piccolo')
    expect(readPiccolo().stato).not.toBe('a-magazzino')
    expect(readStand().status).toBe('active')
  })

  it('posa-gripper unmounts and resets the gripper back to a-magazzino', () => {
    run('tool-stand.preleva-piccolo')
    run('tool-stand.posa-gripper')
    expect(readStand().gripperMontato).toBeNull()
    expect(readPiccolo().stato).toBe('a-magazzino')
    expect(readStand().status).toBe('idle')
  })

  it('setup procedures are admin-gated guided + confirm-required', () => {
    for (const id of [
      'tool-stand.setup-piccolo',
      'tool-stand.setup-medio',
      'tool-stand.setup-grande',
    ]) {
      const c = commands.find((x) => x.id === id)
      expect(c?.requiredRole).toBe('admin')
      expect(c?.requiresConfirm).toBe(true)
      expect(c?.guidedProcedure).toBe(true)
    }
  })

  it('exposes preleva for all 4 gripper kinds + posa + 3 setups = 8 commands', () => {
    const ids = commands.map((c) => c.id).sort()
    expect(ids).toEqual([
      'tool-stand.posa-gripper',
      'tool-stand.preleva-distanziali',
      'tool-stand.preleva-grande',
      'tool-stand.preleva-medio',
      'tool-stand.preleva-piccolo',
      'tool-stand.setup-grande',
      'tool-stand.setup-medio',
      'tool-stand.setup-piccolo',
    ])
  })
})
