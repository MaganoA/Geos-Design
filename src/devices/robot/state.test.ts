import { describe, it, expect } from 'vitest'
import { initialState, deriveStatus, ANGOLI_COUNT } from './state'

describe('robot state', () => {
  it('starts with 6 joint angles, distance, OK status code', () => {
    expect(initialState.angoli).toHaveLength(ANGOLI_COUNT)
    expect(initialState.distanza).toBeGreaterThanOrEqual(0)
    expect(initialState.codiceStato).toBe('OK')
    expect(initialState.codiceErrori).toEqual([])
  })

  it('deriveStatus: empty codiceErrori → active, with errors → error', () => {
    expect(deriveStatus([])).toBe('active')
    expect(deriveStatus(['E07'])).toBe('error')
    expect(deriveStatus(['E07', 'E12'])).toBe('error')
  })
})
