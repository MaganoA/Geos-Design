import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '@/types/command'

interface RoleState {
  role: Role
  setRole: (r: Role) => void
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: 'superadmin',
      setRole: (role) => set({ role }),
    }),
    { name: 'flexpin1.role' },
  ),
)
