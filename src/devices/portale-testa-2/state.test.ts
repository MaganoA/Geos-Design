import { describe, it, expect } from 'vitest'
import { initialState, applyTick, type PortaleTesta2State } from './state'

describe('portale-testa-2 tick', () => {
  it('starts at the right-hand side of the portal, distinct from Testa 1', () => {
    expect(initialState.position.x).toBeGreaterThan(2000)
    expect(initialState.lavorazione?.idLavoro).toBe('JOB-0431')
  })

  it('drifts x toward target while in operativa', () => {
    const s: PortaleTesta2State = {
      ...initialState,
      position: { x: 2236, y: 514, z: 92 },
      positionTarget: { x: 2252, y: 514, z: 92 },
    }
    const next = applyTick(s, 100)
    expect(next.position.x).not.toBe(2236)
  })

  it('does not roll a new random target while parked', () => {
    const parked: PortaleTesta2State = {
      ...initialState,
      mode: 'riposo-1',
      position: { x: 0, y: 0, z: 0 },
      positionTarget: { x: 0, y: 0, z: 0 },
    }
    let s = parked
    for (let i = 0; i < 200; i++) s = applyTick(s, 100)
    expect(s.positionTarget).toEqual({ x: 0, y: 0, z: 0 })
  })
})
