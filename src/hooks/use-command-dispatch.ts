import { useCallback } from 'react'
import { canRunCommand } from '@/lib/role-gate'
import { useModeStore } from '@/store/mode-store'
import { useRoleStore } from '@/store/role-store'
import type { Command } from '@/types/command'

export function useCommandDispatch() {
  const role = useRoleStore((s) => s.role)
  const mode = useModeStore((s) => s.mode)

  const dispatch = useCallback(
    async (
      cmd: Command,
      deviceId: string,
      extra?: { value?: number },
    ) => {
      if (!canRunCommand(cmd, role)) {
         
        console.warn(
          `[command] denied: ${cmd.id} requires ${cmd.requiredRole}, current is ${role}`,
        )
        return
      }
      if (cmd.manualOnly && mode !== 'manuale') return
      await cmd.handler({ deviceId, role, mode, value: extra?.value })
    },
    [role, mode],
  )

  return { dispatch, role, mode }
}
