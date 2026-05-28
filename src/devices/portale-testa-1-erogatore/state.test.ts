import { describe, it, expect } from 'vitest'
import { initialState, deriveStatus } from './state'

describe('portale-testa-1-erogatore state', () => {
  it('starts with both purge and compressed-air off, idle status', () => {
    expect(initialState.stato).toBe('chiuso')
    expect(initialState.spurgoAttivo).toBe(false)
    expect(initialState.ariaCompressaAttiva).toBe(false)
    expect(initialState.status).toBe('idle')
  })

  it('derives a warning whenever the purge is running', () => {
    expect(deriveStatus(true, false)).toBe('warning')
    expect(deriveStatus(true, true)).toBe('warning')
  })

  it('derives active when compressed air is on but the purge is not', () => {
    expect(deriveStatus(false, true)).toBe('active')
  })

  it('derives idle when both are off', () => {
    expect(deriveStatus(false, false)).toBe('idle')
  })
})
