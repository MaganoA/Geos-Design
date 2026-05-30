import { CommandButton } from '@/components/patterns/command-button'
import { GripperMountActions } from '../tool-stand/gripper-mount-actions'
import { commands } from './commands'

export function Toolbar() {
  return (
    <div className="flex h-full items-center justify-center gap-2">
      <GripperMountActions kind="grande" />
      {commands.map((c) => (
        <CommandButton
          key={c.id}
          command={c}
          deviceId="tool-stand-gripper-grande"
        />
      ))}
    </div>
  )
}
