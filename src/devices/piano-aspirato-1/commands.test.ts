import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type PianoAspirato1State } from './state'
import { commands, COMMAND_MODE } from './commands'

const ctx: CommandCtx = {
  deviceId: 'piano-aspirato-1',
  role: 'operatore',
  mode: 'manuale',
}

function run(id: string) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler(ctx)
}

function read(): PianoAspirato1State {
  return useMachineStore.getState().devices[
    'piano-aspirato-1'
  ] as PianoAspirato1State
}

describe('piano-aspirato-1 commands', () => {
  beforeEach(() => {
    useMachineStore.getState().setDevice('piano-aspirato-1', initialState)
  })

  it('modalita-soffio sets soffio and recomputes all ventose to disattiva', () => {
    run('piano-aspirato-1.modalita-soffio')
    const s = read()
    expect(s.modalita).toBe('soffio')
    expect(s.ventose.every((v) => v.stato === 'disattiva')).toBe(true)
  })

  it('modalita-vuoto restores attiva for enabled ventose', () => {
    run('piano-aspirato-1.modalita-soffio')
    run('piano-aspirato-1.modalita-vuoto')
    const s = read()
    expect(s.modalita).toBe('vuoto')
    expect(s.ventose.every((v) => v.stato === 'attiva')).toBe(true)
  })

  it('COMMAND_MODE exposes the toolbar mapping for active-toggle highlighting', () => {
    expect(COMMAND_MODE['piano-aspirato-1.modalita-vuoto']).toBe('vuoto')
    expect(COMMAND_MODE['piano-aspirato-1.modalita-soffio']).toBe('soffio')
  })
})
