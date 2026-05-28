import { describe, it, expect } from 'vitest'
import { initialState, deriveStatus } from './state'

describe('portale-testa-2-lampade-uv state', () => {
  it('starts off, intensity 0, slide alta, idle', () => {
    expect(initialState.accese).toBe(false)
    expect(initialState.intensita).toBe(0)
    expect(initialState.slittaPosizione).toBe('alta')
    expect(initialState.status).toBe('idle')
  })

  it('derives error whenever codiceErrori is not empty', () => {
    expect(deriveStatus(true, 80, ['E12'])).toBe('error')
    expect(deriveStatus(false, 0, ['E12'])).toBe('error')
  })

  it('derives active when lamps are on and intensity > 0', () => {
    expect(deriveStatus(true, 50, [])).toBe('active')
  })

  it('derives idle when off or zero intensity', () => {
    expect(deriveStatus(false, 0, [])).toBe('idle')
    expect(deriveStatus(true, 0, [])).toBe('idle')
    expect(deriveStatus(false, 75, [])).toBe('idle')
  })
})
