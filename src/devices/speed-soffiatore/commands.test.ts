import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type SpeedSoffiatoreState } from './state'
import { commands } from './commands'

const ctx: CommandCtx = {
  deviceId: 'speed-soffiatore',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler(ctx)
}

function read(): SpeedSoffiatoreState {
  return useMachineStore.getState().devices[
    'speed-soffiatore'
  ] as SpeedSoffiatoreState
}

describe('speed-soffiatore commands', () => {
  beforeEach(() => {
    useMachineStore.getState().setDevice('speed-soffiatore', initialState)
  })

  it('accendi turns the blower on (instant, no confirm) and status active', () => {
    run('speed-soffiatore.accendi')
    expect(read().accese).toBe(true)
    expect(read().status).toBe('active')
    const cmd = commands.find((c) => c.id === 'speed-soffiatore.accendi')
    expect(cmd?.requiresConfirm).toBeFalsy()
  })

  it('spegni turns the blower off and status idle', () => {
    run('speed-soffiatore.accendi')
    run('speed-soffiatore.spegni')
    expect(read().accese).toBe(false)
    expect(read().status).toBe('idle')
  })
})
