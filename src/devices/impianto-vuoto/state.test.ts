import { describe, it, expect } from 'vitest'
import { initialState, deriveStatus } from './state'

describe('impianto-vuoto state', () => {
  it('starts off with both pumps off, idle status', () => {
    expect(initialState.accese).toBe(false)
    expect(initialState.pompa1Attiva).toBe(false)
    expect(initialState.pompa2Attiva).toBe(false)
    expect(initialState.status).toBe('idle')
  })

  it('deriveStatus: errors → error', () => {
    expect(deriveStatus(true, true, false, ['VAC-FAULT'])).toBe('error')
  })

  it('deriveStatus: master on + any pump → active', () => {
    expect(deriveStatus(true, true, false, [])).toBe('active')
    expect(deriveStatus(true, false, true, [])).toBe('active')
    expect(deriveStatus(true, true, true, [])).toBe('active')
  })

  it('deriveStatus: master on but both pumps off → idle (armed but no draw)', () => {
    expect(deriveStatus(true, false, false, [])).toBe('idle')
  })

  it('deriveStatus: master off → idle regardless of pump flags', () => {
    expect(deriveStatus(false, true, true, [])).toBe('idle')
    expect(deriveStatus(false, false, false, [])).toBe('idle')
  })
})
