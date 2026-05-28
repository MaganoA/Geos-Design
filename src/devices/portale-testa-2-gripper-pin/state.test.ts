import { describe, it, expect } from 'vitest'
import {
  initialState,
  applyTick,
  deriveStatus,
  type PortaleTesta2GripperPinState,
} from './state'

describe('portale-testa-2-gripper-pin state', () => {
  it('starts closed, angle 0, not rotating, status idle', () => {
    expect(initialState.stato).toBe('chiuso')
    expect(initialState.angolo).toBe(0)
    expect(initialState.angoloDestinazione).toBe(0)
    expect(initialState.inRotazione).toBe(false)
    expect(initialState.status).toBe('idle')
  })

  it('lerps angolo toward destinazione while inRotazione', () => {
    const s: PortaleTesta2GripperPinState = {
      ...initialState,
      angolo: 0,
      angoloDestinazione: 90,
      inRotazione: true,
    }
    const next = applyTick(s, 100)
    expect(next.angolo).toBeGreaterThan(0)
    expect(next.angolo).toBeLessThanOrEqual(90)
  })

  it('auto-stops when angolo reaches destinazione', () => {
    let s: PortaleTesta2GripperPinState = {
      ...initialState,
      angolo: 89,
      angoloDestinazione: 90,
      inRotazione: true,
    }
    for (let i = 0; i < 50; i++) s = applyTick(s, 100)
    expect(s.angolo).toBe(90)
    expect(s.inRotazione).toBe(false)
  })

  it('does not move angolo when not in rotation', () => {
    const s: PortaleTesta2GripperPinState = {
      ...initialState,
      angolo: 30,
      angoloDestinazione: 60,
      inRotazione: false,
    }
    const next = applyTick(s, 100)
    expect(next.angolo).toBe(30)
  })

  it('derives warning while rotating, active when open, idle when closed', () => {
    expect(deriveStatus(true, 'chiuso')).toBe('warning')
    expect(deriveStatus(true, 'aperto')).toBe('warning')
    expect(deriveStatus(false, 'aperto')).toBe('active')
    expect(deriveStatus(false, 'chiuso')).toBe('idle')
  })
})
