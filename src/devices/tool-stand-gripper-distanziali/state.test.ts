import { describe, it, expect } from 'vitest'
import { initialState } from './state'

describe('tool-stand-gripper-distanziali state', () => {
  it('exposes apertura dx/dy and an idle status', () => {
    expect(initialState.dx).toBeGreaterThan(0)
    expect(initialState.dy).toBeGreaterThan(0)
    expect(initialState.status).toBe('idle')
  })
})
