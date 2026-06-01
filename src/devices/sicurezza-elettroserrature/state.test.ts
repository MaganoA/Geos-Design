import { describe, it, expect } from 'vitest'
import { initialState, deriveStatus } from './state'

describe('sicurezza-elettroserrature state', () => {
  it('starts idle with OK status code', () => {
    expect(initialState.codiceStato).toBe('OK')
    expect(initialState.codiceErrori).toEqual([])
    expect(initialState.status).toBe('active')
  })

  it('deriveStatus: errors win → error; otherwise active', () => {
    expect(deriveStatus(['LOCK-FAULT'])).toBe('error')
    expect(deriveStatus([])).toBe('active')
  })
})
