import type { Role } from '@/types/command'

// Role-rank table — higher tier subsumes the privileges of lower tiers.
const rank: Record<Role, number> = {
  operatore: 0,
  admin: 1,
  superadmin: 2,
}

export function canRunCommand(
  cmd: { requiredRole: Role },
  current: Role,
): boolean {
  return rank[current] >= rank[cmd.requiredRole]
}
