import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type SpeedState } from './state'
import { commands } from './commands'

const ctx: CommandCtx = {
  deviceId: 'speed',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler(ctx)
}

function read(): SpeedState {
  return useMachineStore.getState().devices['speed'] as SpeedState
}

describe('speed commands', () => {
  beforeEach(() => {
    useMachineStore.getState().setDevice('speed', initialState)
  })

  it('gira-tavola snaps angoloAsseC to the next 90° step', () => {
    useMachineStore
      .getState()
      .setDevice('speed', { ...initialState, angoloAsseC: 12 })
    run('speed.gira-tavola')
    expect(read().angoloAsseC).toBe(90)
  })

  it('gira-tavola wraps past 360°', () => {
    useMachineStore
      .getState()
      .setDevice('speed', { ...initialState, angoloAsseC: 280 })
    run('speed.gira-tavola')
    expect(read().angoloAsseC).toBe(0)
  })

  it('gira-tavola is operator-only manual without confirm', () => {
    const cmd = commands.find((c) => c.id === 'speed.gira-tavola')
    expect(cmd?.requiredRole).toBe('operatore')
    expect(cmd?.manualOnly).toBe(true)
    expect(cmd?.requiresConfirm).toBeFalsy()
  })
})
