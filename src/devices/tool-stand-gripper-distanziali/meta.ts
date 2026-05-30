import type { DeviceMeta } from '@/types'
export const meta: DeviceMeta = {
  id: 'tool-stand-gripper-distanziali',
  label: 'Gripper dei distanziali',
  parentId: 'tool-stand',
  // Distanziali has no commands of its own (dx/dy are spec-fixed), but
  // it still surfaces the shared GripperMountActions in the toolbar.
  hasCommands: true,
}
