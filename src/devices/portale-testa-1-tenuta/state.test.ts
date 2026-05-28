import { describe, it, expect } from 'vitest'
import { initialState, applyTick, type PortaleTesta1TenutaState } from './state'

function runMode(
  modalita: PortaleTesta1TenutaState['modalita'],
  start: number,
  ticks: number,
): number[] {
  let s: PortaleTesta1TenutaState = { ...initialState, modalita, livelloDepressione: start }
  const out: number[] = []
  for (let i = 0; i < ticks; i++) {
    s = applyTick(s, 100)
    out.push(s.livelloDepressione)
  }
  return out
}

describe('portale-testa-1-tenuta tick', () => {
  it('settles into a high band in aspirazione', () => {
    const v = runMode('aspirazione', 0.5, 40)
    const last = v[v.length - 1]
    expect(last).toBeGreaterThan(0.5)
  })

  it('settles into a low band in soffio', () => {
    const v = runMode('soffio', 0.8, 40)
    expect(v[v.length - 1]).toBeLessThan(0.4)
  })

  it('settles near zero in niente', () => {
    const v = runMode('niente', 0.8, 60)
    expect(v[v.length - 1]).toBeLessThan(0.2)
  })

  it('oscillates continuously (both rises and falls) rather than pinning', () => {
    const v = runMode('aspirazione', 0.78, 220)
    const steady = v.slice(60) // skip the initial approach
    let rose = false
    let fell = false
    let prev = steady[0] ?? 0
    for (let i = 1; i < steady.length; i++) {
      const cur = steady[i] ?? prev
      if (cur > prev + 1e-4) rose = true
      if (cur < prev - 1e-4) fell = true
      prev = cur
    }
    // Real-data feel: the level must keep going up AND down, not flatline.
    expect(rose).toBe(true)
    expect(fell).toBe(true)
    // And the swing must be visible, not just sensor dither.
    expect(Math.max(...steady) - Math.min(...steady)).toBeGreaterThan(0.1)
  })

  it('stays clamped within [0, 1] across all modes', () => {
    for (const m of ['aspirazione', 'soffio', 'niente'] as const) {
      const v = runMode(m, 0.99, 200)
      expect(Math.max(...v)).toBeLessThanOrEqual(1)
      expect(Math.min(...v)).toBeGreaterThanOrEqual(0)
    }
  })
})
