import { ModeButton } from '@/components/patterns/mode-button'
import { useDeviceState } from '@/hooks/use-device-state'
import { commands, COMMAND_MODE } from './commands'
import type { PianoAspirato1State } from './state'

export function Toolbar() {
  const state = useDeviceState<PianoAspirato1State>('piano-aspirato-1')
  const currentMode = state?.modalita ?? 'vuoto'

  return (
    <div className="flex h-full items-center justify-center gap-2">
      {commands.map((c) => (
        <ModeButton
          key={c.id}
          command={c}
          deviceId="piano-aspirato-1"
          active={COMMAND_MODE[c.id] === currentMode}
        />
      ))}
    </div>
  )
}
