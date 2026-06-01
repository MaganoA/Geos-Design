import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type SpeedBarraLavaggioState } from './state'
import { commands } from './commands'

const ctx: CommandCtx = {
  deviceId: 'speed-barra-lavaggio',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler(ctx)
}

function read(): SpeedBarraLavaggioState {
  return useMachineStore.getState().devices[
    'speed-barra-lavaggio'
  ] as SpeedBarraLavaggioState
}

describe('speed-barra-lavaggio commands', () => {
  beforeEach(() => {
    useMachineStore.getState().setDevice('speed-barra-lavaggio', initialState)
  })

  it('accendi turns the wash bar on, status active', () => {
    run('speed-barra-lavaggio.accendi')
    expect(read().accese).toBe(true)
    expect(read().status).toBe('active')
  })

  it('spegni turns it off, status idle', () => {
    run('speed-barra-lavaggio.accendi')
    run('speed-barra-lavaggio.spegni')
    expect(read().accese).toBe(false)
    expect(read().status).toBe('idle')
  })
})
