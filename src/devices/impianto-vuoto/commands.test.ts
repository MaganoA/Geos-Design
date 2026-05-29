import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type ImpiantoVuotoState } from './state'
import { commands } from './commands'

const ctx: CommandCtx = {
  deviceId: 'impianto-vuoto',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler(ctx)
}

function read(): ImpiantoVuotoState {
  return useMachineStore.getState().devices[
    'impianto-vuoto'
  ] as ImpiantoVuotoState
}

describe('impianto-vuoto commands', () => {
  beforeEach(() => {
    useMachineStore.getState().setDevice('impianto-vuoto', initialState)
  })

  it('master accendi turns the system on; spegni off', () => {
    run('impianto-vuoto.accendi')
    expect(read().accese).toBe(true)
    run('impianto-vuoto.spegni')
    expect(read().accese).toBe(false)
  })

  it('attiva-pompa-1 and disattiva-pompa-1 toggle pump 1', () => {
    run('impianto-vuoto.attiva-pompa-1')
    expect(read().pompa1Attiva).toBe(true)
    run('impianto-vuoto.disattiva-pompa-1')
    expect(read().pompa1Attiva).toBe(false)
  })

  it('attiva-pompa-2 and disattiva-pompa-2 toggle pump 2 independently', () => {
    run('impianto-vuoto.attiva-pompa-2')
    expect(read().pompa2Attiva).toBe(true)
    expect(read().pompa1Attiva).toBe(false) // unaffected
    run('impianto-vuoto.disattiva-pompa-2')
    expect(read().pompa2Attiva).toBe(false)
  })

  it('status flips to active when master on + any pump on', () => {
    run('impianto-vuoto.accendi')
    expect(read().status).toBe('idle')
    run('impianto-vuoto.attiva-pompa-1')
    expect(read().status).toBe('active')
    run('impianto-vuoto.disattiva-pompa-1')
    expect(read().status).toBe('idle')
  })

  it('exposes all 6 commands as operator-manual without confirm', () => {
    const ids = commands.map((c) => c.id).sort()
    expect(ids).toEqual([
      'impianto-vuoto.accendi',
      'impianto-vuoto.attiva-pompa-1',
      'impianto-vuoto.attiva-pompa-2',
      'impianto-vuoto.disattiva-pompa-1',
      'impianto-vuoto.disattiva-pompa-2',
      'impianto-vuoto.spegni',
    ])
    commands.forEach((c) => {
      expect(c.requiredRole).toBe('operatore')
      expect(c.manualOnly).toBe(true)
      expect(c.requiresConfirm).toBeFalsy()
    })
  })
})
