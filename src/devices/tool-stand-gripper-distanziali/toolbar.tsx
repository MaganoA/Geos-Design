import { GripperMountActions } from '../tool-stand/gripper-mount-actions'

/**
 * Distanziali has no per-device commands of its own (dx/dy are
 * read-only on this gripper), but the operator still needs the
 * contextual Preleva/Posa action — same as the other three.
 */
export function Toolbar() {
  return (
    <div className="flex h-full items-center justify-center gap-2">
      <GripperMountActions kind="distanziali" />
    </div>
  )
}
