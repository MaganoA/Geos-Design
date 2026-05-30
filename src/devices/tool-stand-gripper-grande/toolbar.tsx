import { GripperMountActions } from '../tool-stand/gripper-mount-actions'
import { GripperValveDock } from '../tool-stand/gripper-valve-dock'

export function Toolbar() {
  return (
    <div className="flex h-full items-center gap-4">
      <GripperMountActions kind="grande" />
      <GripperValveDock kind="grande" />
    </div>
  )
}
