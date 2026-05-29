import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type PianoAspirato2State } from './state'
import { commands, COMMAND_MODE } from './commands'

const ctx: CommandCtx = {
  deviceId: 'piano-aspirato-2',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler(ctx)
}

function read(): PianoAspirato2State {
  return useMachineStore.getState().devices[
    'piano-aspirato-2'
  ] as PianoAspirato2State
}

describe('piano-aspirato-2 commands', () => {
  beforeEach(() => {
    useMachineStore.getState().setDevice('piano-aspirato-2', initialState)
  })

  it('modalita-vuoto / modalita-soffio drive the ventose state', () => {
    run('piano-aspirato-2.modalita-soffio')
    expect(read().ventose.every((v) => v.stato === 'disattiva')).toBe(true)
    run('piano-aspirato-2.modalita-vuoto')
    expect(read().ventose.every((v) => v.stato === 'attiva')).toBe(true)
  })

  it('COMMAND_MODE maps the two modalità', () => {
    expect(COMMAND_MODE['piano-aspirato-2.modalita-vuoto']).toBe('vuoto')
    expect(COMMAND_MODE['piano-aspirato-2.modalita-soffio']).toBe('soffio')
  })

  it('by-pass is a confirm-gated guided procedure', () => {
    const cmd = commands.find((c) => c.id === 'piano-aspirato-2.by-pass')
    expect(cmd?.requiresConfirm).toBe(true)
    expect(cmd?.guidedProcedure).toBe(true)
  })
})
