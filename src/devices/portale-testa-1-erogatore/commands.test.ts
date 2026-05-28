import { describe, it, expect, beforeEach } from 'vitest'
import { useMachineStore } from '@/store/machine-store'
import type { CommandCtx } from '@/types/command'
import { initialState, type PortaleTesta1ErogatoreState } from './state'
import { commands } from './commands'

const ctx: CommandCtx = {
  deviceId: 'portale-testa-1-erogatore',
  role: 'superadmin',
  mode: 'manuale',
}

function run(id: string) {
  const c = commands.find((x) => x.id === id)
  if (!c) throw new Error(`command ${id} not found`)
  c.handler(ctx)
}

function read(): PortaleTesta1ErogatoreState {
  return useMachineStore.getState().devices[
    'portale-testa-1-erogatore'
  ] as PortaleTesta1ErogatoreState
}

describe('portale-testa-1-erogatore commands', () => {
  beforeEach(() => {
    useMachineStore
      .getState()
      .setDevice('portale-testa-1-erogatore', initialState)
  })

  it('attiva spurgo flips only the purge (opens the valve, flags warning)', () => {
    run('portale-testa-1-erogatore.attiva-spurgo')
    const s = read()
    expect(s.spurgoAttivo).toBe(true)
    expect(s.stato).toBe('aperto')
    expect(s.status).toBe('warning')
    // Compressed-air supply is its own switch — the purge command leaves it alone.
    expect(s.ariaCompressaAttiva).toBe(false)
  })

  it('disattiva spurgo closes the valve; status returns to idle when air is also off', () => {
    run('portale-testa-1-erogatore.attiva-spurgo')
    run('portale-testa-1-erogatore.disattiva-spurgo')
    const s = read()
    expect(s.spurgoAttivo).toBe(false)
    expect(s.stato).toBe('chiuso')
    expect(s.status).toBe('idle')
  })

  it('aria compressa toggles only the air supply, leaving the purge as-is', () => {
    run('portale-testa-1-erogatore.aria-compressa')
    let s = read()
    expect(s.ariaCompressaAttiva).toBe(true)
    expect(s.spurgoAttivo).toBe(false)
    expect(s.status).toBe('active')

    run('portale-testa-1-erogatore.aria-compressa')
    s = read()
    expect(s.ariaCompressaAttiva).toBe(false)
    expect(s.status).toBe('idle')
  })

  it('combines independently: aria on + spurgo on still reads as warning, air still on', () => {
    run('portale-testa-1-erogatore.aria-compressa') // air on
    run('portale-testa-1-erogatore.attiva-spurgo') // purge on
    const s = read()
    expect(s.ariaCompressaAttiva).toBe(true)
    expect(s.spurgoAttivo).toBe(true)
    expect(s.status).toBe('warning')
  })

  it('gates raw air/nozzle commands to superadmin and purge procedures to admin', () => {
    const role = (id: string) => commands.find((c) => c.id === id)?.requiredRole
    expect(role('portale-testa-1-erogatore.aria-compressa')).toBe('superadmin')
    expect(role('portale-testa-1-erogatore.cambio-ugello')).toBe('superadmin')
    expect(role('portale-testa-1-erogatore.attiva-spurgo')).toBe('admin')
    expect(role('portale-testa-1-erogatore.disattiva-spurgo')).toBe('admin')
  })

  it('marks spurgo commands as confirm-gated guided procedures', () => {
    const c = commands.find(
      (x) => x.id === 'portale-testa-1-erogatore.attiva-spurgo',
    )
    expect(c?.requiresConfirm).toBe(true)
    expect(c?.guidedProcedure).toBe(true)
  })
})
