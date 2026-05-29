import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type ImpiantoAcquaState } from './state'
import { commands } from './commands'

const ctx: CommandCtx = {
  deviceId: 'impianto-acqua',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler(ctx)
}

function read(): ImpiantoAcquaState {
  return useMachineStore.getState().devices[
    'impianto-acqua'
  ] as ImpiantoAcquaState
}

describe('impianto-acqua commands', () => {
  beforeEach(() => {
    useMachineStore.getState().setDevice('impianto-acqua', initialState)
  })

  it('accendi turns water on and status active', () => {
    run('impianto-acqua.accendi')
    expect(read().accese).toBe(true)
    expect(read().status).toBe('active')
  })

  it('spegni turns water off and status idle', () => {
    run('impianto-acqua.accendi')
    run('impianto-acqua.spegni')
    expect(read().accese).toBe(false)
    expect(read().status).toBe('idle')
  })
})
