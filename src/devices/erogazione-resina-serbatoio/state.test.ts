import { describe, it, expect } from 'vitest'
import {
  deriveStatus,
  erogazioneResinaSerbatoioSchema,
  initialState,
} from './state'

describe('erogazione-resina-serbatoio state', () => {
  it('initialState passes schema', () => {
    expect(() =>
      erogazioneResinaSerbatoioSchema.parse(initialState),
    ).not.toThrow()
  })

  describe('deriveStatus', () => {
    it('error when pressione not ok', () => {
      expect(deriveStatus(false, 0.5, 0.1, true)).toBe('error')
    })
    it('warning when below threshold', () => {
      expect(deriveStatus(true, 0.05, 0.1, true)).toBe('warning')
    })
    it('active when pressurizing and above threshold', () => {
      expect(deriveStatus(true, 0.5, 0.1, true)).toBe('active')
    })
    it('idle when resting and above threshold', () => {
      expect(deriveStatus(true, 0.5, 0.1, false)).toBe('idle')
    })
  })
})
