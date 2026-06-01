import { describe, it, expect } from 'vitest'
import {
  applyTick,
  baiaGrezziTastatoreSchema,
  deriveStatus,
  initialState,
} from './state'

describe('baia-grezzi-tastatore state', () => {
  it('initialState passes schema', () => {
    expect(() => baiaGrezziTastatoreSchema.parse(initialState)).not.toThrow()
  })

  it('drift stays within 0.5mm of seed across one tick', () => {
    const next = applyTick(initialState)
    expect(Math.abs(next.laser.lungo1 - initialState.laser.lungo1)).toBeLessThan(0.5)
    expect(Math.abs(next.laser.sinistra - initialState.laser.sinistra)).toBeLessThan(0.5)
  })

  describe('deriveStatus', () => {
    it('error on errori', () => {
      expect(deriveStatus(['E-T-01'])).toBe('error')
    })
    it('active when ok', () => {
      expect(deriveStatus([])).toBe('active')
    })
  })
})
