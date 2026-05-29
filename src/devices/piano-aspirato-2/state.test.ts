import { describe, it, expect } from 'vitest'
import { initialState, deriveStatus, VENTOSE_LAYOUT } from './state'

describe('piano-aspirato-2 state', () => {
  it('exposes the same 5×12 = 60 ventose layout as piano 1', () => {
    expect(VENTOSE_LAYOUT.rows).toBe(5)
    expect(VENTOSE_LAYOUT.cols).toBe(12)
    expect(VENTOSE_LAYOUT.total).toBe(60)
    expect(VENTOSE_LAYOUT.boardDimensions).toEqual({
      width: 3720,
      height: 1600,
    })
  })

  it('starts with no lastre bypassed', () => {
    expect(initialState.lastreBypass).toEqual([])
    expect(initialState.modalita).toBe('vuoto')
    expect(initialState.ventose).toHaveLength(60)
  })

  it('deriveStatus: errors → error; otherwise active', () => {
    expect(deriveStatus(['VAC-2'])).toBe('error')
    expect(deriveStatus([])).toBe('active')
  })
})
