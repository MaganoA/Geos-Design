import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type PortaleTesta2LampadeUvState } from './state'
import { commands } from './commands'

const ctx: CommandCtx = {
  deviceId: 'portale-testa-2-lampade-uv',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string, value?: number) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler({ ...ctx, value })
}

function read(): PortaleTesta2LampadeUvState {
  return useMachineStore.getState().devices[
    'portale-testa-2-lampade-uv'
  ] as PortaleTesta2LampadeUvState
}

describe('portale-testa-2-lampade-uv commands', () => {
  beforeEach(() => {
    useMachineStore
      .getState()
      .setDevice('portale-testa-2-lampade-uv', initialState)
  })

  it('accendi turns the lamps on (with confirm)', () => {
    run('portale-testa-2-lampade-uv.accendi')
    const s = read()
    expect(s.accese).toBe(true)
    const cmd = commands.find(
      (c) => c.id === 'portale-testa-2-lampade-uv.accendi',
    )
    expect(cmd?.requiresConfirm).toBe(true)
  })

  it('spegni turns the lamps off and is instant (no confirm)', () => {
    run('portale-testa-2-lampade-uv.accendi')
    run('portale-testa-2-lampade-uv.spegni')
    expect(read().accese).toBe(false)
    const cmd = commands.find(
      (c) => c.id === 'portale-testa-2-lampade-uv.spegni',
    )
    expect(cmd?.requiresConfirm).toBeFalsy()
  })

  it('modifica-potenza writes intensita from CommandCtx.value', () => {
    run('portale-testa-2-lampade-uv.modifica-potenza', 75)
    expect(read().intensita).toBe(75)
  })

  it('slitta-alta and slitta-bassa snap slittaPosizione', () => {
    run('portale-testa-2-lampade-uv.slitta-bassa')
    expect(read().slittaPosizione).toBe('bassa')
    run('portale-testa-2-lampade-uv.slitta-alta')
    expect(read().slittaPosizione).toBe('alta')
  })

  it('modifica-potenza declares the expected value-input range', () => {
    const cmd = commands.find(
      (c) => c.id === 'portale-testa-2-lampade-uv.modifica-potenza',
    )
    expect(cmd?.requiresValueInput).toEqual(
      expect.objectContaining({ min: 0, max: 100, step: 5, unit: '%' }),
    )
  })

  it('status flips to active when lamps emit, idle when off', () => {
    run('portale-testa-2-lampade-uv.accendi')
    run('portale-testa-2-lampade-uv.modifica-potenza', 50)
    expect(read().status).toBe('active')
    run('portale-testa-2-lampade-uv.spegni')
    expect(read().status).toBe('idle')
  })
})
