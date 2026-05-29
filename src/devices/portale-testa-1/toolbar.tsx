import { ModeButton } from '@/components/patterns/mode-button'
import { useDeviceState } from '@/hooks/use-device-state'
import { commands, COMMAND_MODE } from './commands'
import type { PortaleTesta1State } from './state'

export function Toolbar() {
  const state = useDeviceState<PortaleTesta1State>('portale-testa-1')
  const currentMode = state?.mode ?? 'operativa'

  return (
    <div className="flex h-full items-center justify-center gap-2">
      {commands.map((c) => (
        <ModeButton
          key={c.id}
          command={c}
          deviceId="portale-testa-1"
          active={COMMAND_MODE[c.id] === currentMode}
        />
      ))}
    </div>
  )
}
