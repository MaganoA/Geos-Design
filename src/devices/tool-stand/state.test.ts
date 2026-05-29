import { describe, it, expect } from 'vitest'
import { initialState, deriveStatus } from './state'

describe('tool-stand state', () => {
  it('starts with no gripper mounted, idle', () => {
    expect(initialState.gripperMontato).toBeNull()
    expect(initialState.status).toBe('idle')
  })

  it('deriveStatus: a gripper mounted → active, else idle', () => {
    expect(deriveStatus('piccolo')).toBe('active')
    expect(deriveStatus('medio')).toBe('active')
    expect(deriveStatus('grande')).toBe('active')
    expect(deriveStatus('distanziali')).toBe('active')
    expect(deriveStatus(null)).toBe('idle')
  })
})
