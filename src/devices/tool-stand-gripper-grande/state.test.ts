import { describe, it, expect } from 'vitest'
import { initialState, deriveStatus } from './state'

describe('tool-stand-gripper-grande state', () => {
  it('starts in magazzino, idle, with 4 valves all closed', () => {
    expect(initialState.stato).toBe('a-magazzino')
    expect(initialState.status).toBe('idle')
    expect(initialState.ventose).toHaveLength(4)
    expect(initialState.ventose.every((v) => !v.attiva)).toBe(true)
  })

  it('deriveStatus: a-magazzino → idle, mounted modes → active', () => {
    expect(deriveStatus('a-magazzino')).toBe('idle')
    expect(deriveStatus('niente')).toBe('active')
    expect(deriveStatus('vuoto')).toBe('active')
    expect(deriveStatus('soffio')).toBe('active')
  })
})
