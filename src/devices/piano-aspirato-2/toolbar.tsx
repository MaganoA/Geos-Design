import { CommandButton } from '@/components/patterns/command-button'
import { ModeButton } from '@/components/patterns/mode-button'
import { useDeviceState } from '@/hooks/use-device-state'
import { commands, COMMAND_MODE } from './commands'
import type { PianoAspirato2State } from './state'

export function Toolbar() {
  const state = useDeviceState<PianoAspirato2State>('piano-aspirato-2')
  const currentMode = state?.modalita ?? 'vuoto'

  return (
    <div className="flex h-full items-center justify-center gap-2">
      {commands.map((c) => {
        if (c.id in COMMAND_MODE) {
          return (
            <ModeButton
              key={c.id}
              command={c}
              deviceId="piano-aspirato-2"
              active={COMMAND_MODE[c.id] === currentMode}
            />
          )
        }
        return (
          <CommandButton key={c.id} command={c} deviceId="piano-aspirato-2" />
        )
      })}
    </div>
  )
}
