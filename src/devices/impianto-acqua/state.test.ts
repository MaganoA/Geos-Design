import { describe, it, expect } from 'vitest'
import { initialState, deriveStatus } from './state'

describe('impianto-acqua state', () => {
  it('starts off with both codes OK, idle status', () => {
    expect(initialState.accese).toBe(false)
    expect(initialState.codiceStatoInterna).toBe('OK')
    expect(initialState.codiceStatoEsterna).toBe('OK')
    expect(initialState.status).toBe('idle')
  })

  it('deriveStatus: errors → error; on → active; off → idle', () => {
    expect(deriveStatus(true, ['LEAK-IN'])).toBe('error')
    expect(deriveStatus(true, [])).toBe('active')
    expect(deriveStatus(false, [])).toBe('idle')
  })
})
