import { describe, it, expect } from 'vitest'
import { canRunCommand } from './role-gate'

describe('canRunCommand', () => {
  it('operatore cannot run admin command', () => {
    expect(canRunCommand({ requiredRole: 'admin' }, 'operatore')).toBe(false)
  })
  it('admin can run operatore command', () => {
    expect(canRunCommand({ requiredRole: 'operatore' }, 'admin')).toBe(true)
  })
  it('superadmin can run anything', () => {
    expect(canRunCommand({ requiredRole: 'superadmin' }, 'superadmin')).toBe(true)
    expect(canRunCommand({ requiredRole: 'admin' }, 'superadmin')).toBe(true)
    expect(canRunCommand({ requiredRole: 'operatore' }, 'superadmin')).toBe(true)
  })
})
