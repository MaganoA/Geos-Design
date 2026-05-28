import { CommandButton } from '@/components/patterns/command-button'
import { commands } from './commands'

/**
 * Renders the erogatore commands as confirm-gated buttons. Role and
 * manual-mode gating are handled inside CommandButton, so superadmin
 * sees the raw air/nozzle controls enabled while admin gets the guided
 * purge procedures; lower roles see them disabled.
 */
export function Toolbar() {
  return (
    <div className="flex h-full items-center justify-center gap-2">
      {commands.map((c) => (
        <CommandButton
          key={c.id}
          command={c}
          deviceId="portale-testa-1-erogatore"
        />
      ))}
    </div>
  )
}
