import { describe, it, expect } from 'vitest'
import { getDevice, allDevices } from './index'

describe('device registry', () => {
  it('returns the requested device meta', () => {
    expect(getDevice('portale-testa-1').meta.label).toBe('Testa 1')
  })
  it('falls back to _stub for unknown ids', () => {
    expect(getDevice('does-not-exist').meta.id).toBe('_stub')
  })
  it('enumerates all registered devices', () => {
    expect(allDevices().length).toBeGreaterThanOrEqual(15)
  })
})
