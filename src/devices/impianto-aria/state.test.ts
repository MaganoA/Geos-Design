import { describe, it, expect } from 'vitest'
import { initialState, deriveStatus } from './state'

describe('impianto-aria state', () => {
  it('starts off, idle status', () => {
    expect(initialState.accese).toBe(false)
    expect(initialState.status).toBe('idle')
  })

  it('deriveStatus: errors → error; on → active; off → idle', () => {
    expect(deriveStatus(true, ['PRESS-LOW'])).toBe('error')
    expect(deriveStatus(true, [])).toBe('active')
    expect(deriveStatus(false, [])).toBe('idle')
  })
})
