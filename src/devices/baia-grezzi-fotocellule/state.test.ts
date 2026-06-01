import { describe, it, expect } from 'vitest'
import {
  baiaGrezziFotocelluleSchema,
  deriveStatus,
  initialState,
} from './state'

describe('baia-grezzi-fotocellule state', () => {
  it('initialState passes schema', () => {
    expect(() => baiaGrezziFotocelluleSchema.parse(initialState)).not.toThrow()
  })

  describe('deriveStatus', () => {
    it('active when beam attiva', () => {
      expect(deriveStatus('attiva')).toBe('active')
    })
    it('warning when beam interrotta (intrusion)', () => {
      expect(deriveStatus('interrotta')).toBe('warning')
    })
    it('idle when beam disattiva', () => {
      expect(deriveStatus('disattiva')).toBe('idle')
    })
  })
})
