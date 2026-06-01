import { describe, it, expect } from 'vitest'
import { initialState, deriveStatus } from './state'

describe('speed-barra-lavaggio state', () => {
  it('starts off, idle status', () => {
    expect(initialState.accese).toBe(false)
    expect(initialState.status).toBe('idle')
  })

  it('deriveStatus: errors → error; on → active; off → idle', () => {
    expect(deriveStatus(true, ['E01'])).toBe('error')
    expect(deriveStatus(true, [])).toBe('active')
    expect(deriveStatus(false, [])).toBe('idle')
  })
})
