import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type PortaleTesta2State } from './state'
import { commands } from './commands'

const ctx: CommandCtx = {
  deviceId: 'portale-testa-2',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler(ctx)
}

function read(): PortaleTesta2State {
  return useMachineStore.getState().devices['portale-testa-2'] as PortaleTesta2State
}

describe('portale-testa-2 commands', () => {
  beforeEach(() => {
    useMachineStore.getState().setDevice('portale-testa-2', initialState)
  })

  it('riposo-1 parks the head at (0, 0, 0)', () => {
    run('portale-testa-2.riposo-1')
    const s = read()
    expect(s.mode).toBe('riposo-1')
    expect(s.positionTarget).toEqual({ x: 0, y: 0, z: 0 })
  })

  it('riposo-2 parks the head at (3500, 0, 0)', () => {
    run('portale-testa-2.riposo-2')
    const s = read()
    expect(s.mode).toBe('riposo-2')
    expect(s.positionTarget).toEqual({ x: 3500, y: 0, z: 0 })
  })

  it('second tap on the same Riposo returns to operativa', () => {
    run('portale-testa-2.riposo-1')
    run('portale-testa-2.riposo-1')
    const s = read()
    expect(s.mode).toBe('operativa')
  })
})
