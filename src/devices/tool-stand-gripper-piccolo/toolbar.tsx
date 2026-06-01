import { GripperMountActions } from '../tool-stand/gripper-mount-actions'
import { GripperValveDock } from '../tool-stand/gripper-valve-dock'

/**
 * Toolbar composition:
 *   - GripperMountActions  → Preleva / Posa contextual CTA
 *   - GripperValveDock     → setup + valvole modals + stato segmented
 *     (mounts itself only when the gripper is actually on the head)
 *
 * The legacy modifica-dx / modifica-dy CommandButtons are gone: the
 * Setup Gripper modal in the dock now owns both axes together.
 */
export function Toolbar() {
  return (
    <div className="flex h-full items-center gap-4">
      <GripperMountActions kind="piccolo" />
      <GripperValveDock kind="piccolo" />
    </div>
  )
}
