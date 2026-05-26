import { describe, it, expect } from 'vitest'
import { initialState, applyTick, type PortaleTesta1State } from './state'

describe('portale-testa-1 tick', () => {
  it('drifts x toward target', () => {
    const s: PortaleTesta1State = {
      ...initialState,
      position: { x: 1264, y: 514, z: 92 },
      positionTarget: { x: 1280, y: 514, z: 92 },
    }
    const next = applyTick(s, 100)
    expect(next.position.x).not.toBe(1264)
  })
  it('keeps idLavoro stable across ticks', () => {
    const s = applyTick(initialState, 100)
    expect(s.lavorazione?.idLavoro).toBe(initialState.lavorazione?.idLavoro)
  })
})
