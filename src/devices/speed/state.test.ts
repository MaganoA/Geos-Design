import { describe, it, expect } from 'vitest'
import {
  initialState,
  applyTick,
  deriveStatus,
  type SpeedState,
} from './state'

describe('speed state', () => {
  it('starts with sensible defaults (active, T07 connected, T12 last available)', () => {
    expect(initialState.status).toBe('active')
    expect(initialState.utensileConnesso).toBe('T07')
    expect(initialState.ultimoUtensileDisponibile).toBe('T12')
    expect(initialState.angoloAsseC).toBe(0)
    expect(initialState.angoloRalla).toBe(0)
    expect(initialState.codiceErrori).toEqual([])
  })

  it('refreshes dataOra each tick toward the wall clock', () => {
    const t0 = Date.now() - 60_000
    const s: SpeedState = { ...initialState, dataOra: t0 }
    const next = applyTick(s, 100)
    expect(next.dataOra).toBeGreaterThan(t0)
  })

  it('spins angoloAsseC and angoloRalla continuously, wrapping at 360°', () => {
    const s: SpeedState = {
      ...initialState,
      angoloAsseC: 358,
      angoloRalla: 359.5,
    }
    const next = applyTick(s, 200)
    // both wrap below 360 (continuous rotation)
    expect(next.angoloAsseC).toBeGreaterThanOrEqual(0)
    expect(next.angoloAsseC).toBeLessThan(360)
    expect(next.angoloRalla).toBeGreaterThanOrEqual(0)
    expect(next.angoloRalla).toBeLessThan(360)
  })

  it('keeps velocità within plausible band when on (live oscillation, not flatline)', () => {
    let s: SpeedState = { ...initialState, velocitaRelazionale: 250 }
    const vals: number[] = []
    for (let i = 0; i < 200; i++) {
      s = applyTick(s, 100)
      vals.push(s.velocitaRelazionale)
    }
    const max = Math.max(...vals)
    const min = Math.min(...vals)
    expect(max - min).toBeGreaterThan(10) // not flat
    expect(min).toBeGreaterThan(150)
    expect(max).toBeLessThan(360)
  })

  it('deriveStatus: errors → error; using last tool → warning; otherwise → active', () => {
    expect(deriveStatus('T07', 'T12', ['E01'])).toBe('error')
    expect(deriveStatus('T12', 'T12', [])).toBe('warning')
    expect(deriveStatus('T07', 'T12', [])).toBe('active')
  })
})
