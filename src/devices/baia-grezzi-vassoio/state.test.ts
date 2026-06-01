import { describe, it, expect } from 'vitest'
import { baiaGrezziVassoioSchema, initialState } from './state'

describe('baia-grezzi-vassoio state', () => {
  it('initialState passes schema', () => {
    expect(() => baiaGrezziVassoioSchema.parse(initialState)).not.toThrow()
  })
  it('has the expected parent', () => {
    expect(initialState.parentId).toBe('baia-grezzi')
  })
})
