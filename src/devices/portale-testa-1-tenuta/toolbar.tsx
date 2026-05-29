import { ModeButton } from '@/components/patterns/mode-button'
import { useDeviceState } from '@/hooks/use-device-state'
import { commands, COMMAND_MODE } from './commands'
import type { PortaleTesta1TenutaState } from './state'

export function Toolbar() {
  const state = useDeviceState<PortaleTesta1TenutaState>('portale-testa-1-tenuta')
  const currentMode = state?.modalita ?? 'niente'

  return (
    <div className="flex h-full items-center justify-center gap-2">
      {commands.map((c) => (
        <ModeButton
          key={c.id}
          command={c}
          deviceId="portale-testa-1-tenuta"
          active={COMMAND_MODE[c.id] === currentMode}
        />
      ))}
    </div>
  )
}
