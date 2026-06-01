import { describe, it, expect } from 'vitest'
import {
  deriveStatus,
  erogazioneResinaAlimentatoreInsertiSchema,
  initialState,
} from './state'

describe('erogazione-resina-alimentatore-inserti state', () => {
  it('initialState passes schema', () => {
    expect(() =>
      erogazioneResinaAlimentatoreInsertiSchema.parse(initialState),
    ).not.toThrow()
  })

  describe('deriveStatus', () => {
    it('error on errori', () => {
      expect(deriveStatus(true, ['E-AL-01'])).toBe('error')
    })
    it('idle when spento', () => {
      expect(deriveStatus(false, [])).toBe('idle')
    })
    it('active when acceso', () => {
      expect(deriveStatus(true, [])).toBe('active')
    })
  })
})
