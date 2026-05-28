import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type PortaleTesta1TenutaState } from './state'
import { commands } from './commands'

const ctx: CommandCtx = {
  deviceId: 'portale-testa-1-tenuta',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler(ctx)
}

function read(): PortaleTesta1TenutaState {
  return useMachineStore.getState().devices[
    'portale-testa-1-tenuta'
  ] as PortaleTesta1TenutaState
}

describe('portale-testa-1-tenuta commands', () => {
  beforeEach(() => {
    useMachineStore.getState().setDevice('portale-testa-1-tenuta', initialState)
  })

  it('sets modalita to soffio', () => {
    run('portale-testa-1-tenuta.soffio')
    expect(read().modalita).toBe('soffio')
  })

  it('sets modalita to niente', () => {
    run('portale-testa-1-tenuta.niente')
    expect(read().modalita).toBe('niente')
  })

  it('sets modalita to aspirazione', () => {
    useMachineStore
      .getState()
      .setDevice('portale-testa-1-tenuta', { ...initialState, modalita: 'niente' })
    run('portale-testa-1-tenuta.aspirazione')
    expect(read().modalita).toBe('aspirazione')
  })
})
