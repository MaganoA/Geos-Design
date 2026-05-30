import type { DeviceMeta } from '@/types'
export const meta: DeviceMeta = {
  id: 'tool-stand',
  label: 'Tool stand',
  parentId: null,
  // Pure organisational container in the tree — clicking the row only
  // toggles expand/collapse on its four gripper children. Actions are
  // gripper-specific (mount happens from the Robot panel CTA which
  // dispatches the existing tool-stand.preleva-{kind} commands by id;
  // change-apertura / valvole live on each gripper's own toolbar).
  selectable: false,
  hasData: false,
  hasCommands: false,
}
