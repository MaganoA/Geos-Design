import { ModeButton } from '@/components/patterns/mode-button'
import { useDeviceState } from '@/hooks/use-device-state'
import { commands, COMMAND_MODE } from './commands'
import type { PortaleTesta2State } from './state'

export function Toolbar() {
  const state = useDeviceState<PortaleTesta2State>('portale-testa-2')
  const currentMode = state?.mode ?? 'operativa'

  return (
    <div className="flex h-full items-center justify-center gap-2">
      {commands.map((c) => (
        <ModeButton
          key={c.id}
          command={c}
          deviceId="portale-testa-2"
          active={COMMAND_MODE[c.id] === currentMode}
        />
      ))}
    </div>
  )
}
