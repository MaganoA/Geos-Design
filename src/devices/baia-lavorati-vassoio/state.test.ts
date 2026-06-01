import { describe, it, expect } from 'vitest'
import { baiaLavoratiVassoioSchema, initialState } from './state'

describe('baia-lavorati-vassoio state', () => {
  it('initialState passes schema', () => {
    expect(() => baiaLavoratiVassoioSchema.parse(initialState)).not.toThrow()
  })
  it('has the expected parent', () => {
    expect(initialState.parentId).toBe('baia-lavorati')
  })
})
