import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type ImpiantoAriaState } from './state'
import { commands } from './commands'

const ctx: CommandCtx = {
  deviceId: 'impianto-aria',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler(ctx)
}

function read(): ImpiantoAriaState {
  return useMachineStore.getState().devices['impianto-aria'] as ImpiantoAriaState
}

describe('impianto-aria commands', () => {
  beforeEach(() => {
    useMachineStore.getState().setDevice('impianto-aria', initialState)
  })

  it('accendi turns air on (active)', () => {
    run('impianto-aria.accendi')
    expect(read().accese).toBe(true)
    expect(read().status).toBe('active')
  })

  it('spegni turns air off (idle)', () => {
    run('impianto-aria.accendi')
    run('impianto-aria.spegni')
    expect(read().accese).toBe(false)
    expect(read().status).toBe('idle')
  })
})
