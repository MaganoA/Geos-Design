import { describe, it, expect } from 'vitest'
import { baiaGrezziSchema, deriveStatus, initialState } from './state'

describe('baia-grezzi state', () => {
  it('initialState passes schema', () => {
    expect(() => baiaGrezziSchema.parse(initialState)).not.toThrow()
  })

  describe('deriveStatus', () => {
    it('error when any errore', () => {
      expect(deriveStatus(true, true, 4, ['E-01'])).toBe('error')
    })
    it('warning when barriere down (intrusion risk)', () => {
      expect(deriveStatus(true, false, 4, [])).toBe('warning')
    })
    it('idle when no vassoio', () => {
      expect(deriveStatus(false, true, 0, [])).toBe('idle')
    })
    it('idle when vassoio present but empty', () => {
      expect(deriveStatus(true, true, 0, [])).toBe('idle')
    })
    it('active with vassoio + lastre + barriere ok', () => {
      expect(deriveStatus(true, true, 4, [])).toBe('active')
    })
  })
})
