import { describe, it, expect } from 'vitest'
import { baiaLavoratiSchema, deriveStatus, initialState } from './state'

describe('baia-lavorati state', () => {
  it('initialState passes schema', () => {
    expect(() => baiaLavoratiSchema.parse(initialState)).not.toThrow()
  })

  describe('deriveStatus', () => {
    it('error on errori', () => {
      expect(deriveStatus(2, ['E-02'])).toBe('error')
    })
    it('idle when empty', () => {
      expect(deriveStatus(0, [])).toBe('idle')
    })
    it('active when populated', () => {
      expect(deriveStatus(3, [])).toBe('active')
    })
  })
})
