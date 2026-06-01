import { describe, it, expect } from 'vitest'
import {
  PISTONI_COUNT,
  deriveStatus,
  dispenserDistanzialiSchema,
  initialState,
  type PistoneState,
} from './state'

describe('dispenser-distanziali state', () => {
  it('initialState passes schema and has 6 pistoni', () => {
    expect(() => dispenserDistanzialiSchema.parse(initialState)).not.toThrow()
    expect(initialState.pistoni).toHaveLength(PISTONI_COUNT)
  })

  describe('deriveStatus', () => {
    const allBack: PistoneState[] = Array.from({ length: 6 }, () => ({
      stato: 'indietro',
    }))
    const oneOut: PistoneState[] = [
      { stato: 'avanti' },
      ...Array.from({ length: 5 }, () => ({ stato: 'indietro' as const })),
    ]
    it('error on errori', () => {
      expect(deriveStatus(allBack, ['E-DS-01'])).toBe('error')
    })
    it('idle when all retratti', () => {
      expect(deriveStatus(allBack, [])).toBe('idle')
    })
    it('active when any avanti', () => {
      expect(deriveStatus(oneOut, [])).toBe('active')
    })
  })
})
