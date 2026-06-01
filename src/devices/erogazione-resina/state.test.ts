import { describe, it, expect } from 'vitest'
import { deriveStatus, erogazioneResinaSchema, initialState } from './state'

describe('erogazione-resina state', () => {
  it('initialState passes schema', () => {
    expect(() => erogazioneResinaSchema.parse(initialState)).not.toThrow()
  })

  describe('deriveStatus', () => {
    it('error on errori', () => {
      expect(deriveStatus(true, ['E-RS-01'])).toBe('error')
    })
    it('error when pressione is not ok', () => {
      expect(deriveStatus(false, [])).toBe('error')
    })
    it('active when pressione ok and no errori', () => {
      expect(deriveStatus(true, [])).toBe('active')
    })
  })
})
