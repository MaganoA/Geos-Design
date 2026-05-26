import { describe, it, expect } from 'vitest'
import { lerpToward } from './animate-value'

describe('lerpToward', () => {
  it('moves toward target by rate * dt', () => {
    // 50 units/s over 100 ms = 5-unit step.
    expect(lerpToward(0, 10, 50, 100)).toBeCloseTo(5, 5)
  })
  it('snaps when within epsilon', () => {
    expect(lerpToward(9.9999, 10, 0.5, 100)).toBe(10)
  })
  it('clamps overshoot', () => {
    expect(lerpToward(9, 10, 10, 1000)).toBe(10)
  })
})
