import type { DeviceMeta } from '@/types'
export const meta: DeviceMeta = {
  id: 'tool-stand',
  label: 'Tool stand',
  parentId: null,
  // Tool stand has commands (preleva/posa gripper, setup procedures) but no
  // state of its own — its grippers carry the data.
  hasData: false,
}
