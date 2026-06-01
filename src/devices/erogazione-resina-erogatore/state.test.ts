import { describe, it, expect } from 'vitest'
import {
  deriveStatus,
  erogazioneResinaErogatoreSchema,
  initialState,
} from './state'

describe('erogazione-resina-erogatore state', () => {
  it('initialState passes schema', () => {
    expect(() =>
      erogazioneResinaErogatoreSchema.parse(initialState),
    ).not.toThrow()
  })

  describe('deriveStatus', () => {
    it('warning when spurgo in flight', () => {
      expect(deriveStatus('chiuso', true)).toBe('warning')
      expect(deriveStatus('aperto', true)).toBe('warning')
    })
    it('active when aperto without spurgo', () => {
      expect(deriveStatus('aperto', false)).toBe('active')
    })
    it('idle when chiuso without spurgo', () => {
      expect(deriveStatus('chiuso', false)).toBe('idle')
    })
  })
})
