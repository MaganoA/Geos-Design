import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type PortaleTesta2GripperPinState } from './state'
import { commands } from './commands'

const ctx: CommandCtx = {
  deviceId: 'portale-testa-2-gripper-pin',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string, value?: number) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler({ ...ctx, value })
}

function read(): PortaleTesta2GripperPinState {
  return useMachineStore.getState().devices[
    'portale-testa-2-gripper-pin'
  ] as PortaleTesta2GripperPinState
}

describe('portale-testa-2-gripper-pin commands', () => {
  beforeEach(() => {
    useMachineStore
      .getState()
      .setDevice('portale-testa-2-gripper-pin', initialState)
  })

  it('apri opens the jaws', () => {
    run('portale-testa-2-gripper-pin.apri')
    expect(read().stato).toBe('aperto')
    expect(read().status).toBe('active')
  })

  it('chiudi closes the jaws', () => {
    run('portale-testa-2-gripper-pin.apri')
    run('portale-testa-2-gripper-pin.chiudi')
    expect(read().stato).toBe('chiuso')
    expect(read().status).toBe('idle')
  })

  it('modifica-angolo writes angoloDestinazione, does not start rotation', () => {
    run('portale-testa-2-gripper-pin.modifica-angolo', 60)
    const s = read()
    expect(s.angoloDestinazione).toBe(60)
    expect(s.inRotazione).toBe(false)
  })

  it('ruota toggles inRotazione', () => {
    run('portale-testa-2-gripper-pin.ruota')
    expect(read().inRotazione).toBe(true)
    expect(read().status).toBe('warning')
    run('portale-testa-2-gripper-pin.ruota')
    expect(read().inRotazione).toBe(false)
  })

  it('preleva-pin closes the jaws and is a guided + confirmed procedure', () => {
    run('portale-testa-2-gripper-pin.apri')
    run('portale-testa-2-gripper-pin.preleva-pin')
    expect(read().stato).toBe('chiuso')
    const cmd = commands.find(
      (c) => c.id === 'portale-testa-2-gripper-pin.preleva-pin',
    )
    expect(cmd?.requiresConfirm).toBe(true)
    expect(cmd?.guidedProcedure).toBe(true)
  })

  it('modifica-angolo declares the expected value-input range', () => {
    const cmd = commands.find(
      (c) => c.id === 'portale-testa-2-gripper-pin.modifica-angolo',
    )
    expect(cmd?.requiresValueInput).toEqual(
      expect.objectContaining({ min: 0, max: 90, step: 1, unit: '°' }),
    )
  })
})
