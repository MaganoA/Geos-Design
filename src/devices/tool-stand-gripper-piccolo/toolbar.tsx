import { CommandButton } from '@/components/patterns/command-button'
import { commands } from './commands'

export function Toolbar() {
  return (
    <div className="flex h-full items-center justify-center gap-2">
      {commands.map((c) => (
        <CommandButton
          key={c.id}
          command={c}
          deviceId="tool-stand-gripper-piccolo"
        />
      ))}
    </div>
  )
}
