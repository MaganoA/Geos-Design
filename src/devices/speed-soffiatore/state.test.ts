import { describe, it, expect } from 'vitest'
import { initialState, deriveStatus } from './state'

describe('speed-soffiatore state', () => {
  it('starts off, idle status', () => {
    expect(initialState.accese).toBe(false)
    expect(initialState.status).toBe('idle')
  })

  it('derives error when codiceErrori is not empty', () => {
    expect(deriveStatus(true, ['E01'])).toBe('error')
    expect(deriveStatus(false, ['E01'])).toBe('error')
  })

  it('derives active when on and no errors', () => {
    expect(deriveStatus(true, [])).toBe('active')
  })

  it('derives idle when off', () => {
    expect(deriveStatus(false, [])).toBe('idle')
  })
})
