import { z } from 'zod'

export const toolStandGripperDistanzialiSchema = z.object({
  kind: z.literal('tool-stand-gripper-distanziali'),
  id: z.literal('tool-stand-gripper-distanziali'),
  label: z.string(),
  parentId: z.literal('tool-stand'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  /** Apertura — mm on the X axis. */
  dx: z.number(),
  /** Apertura — mm on the Y axis. */
  dy: z.number(),
})
export type ToolStandGripperDistanzialiState = z.infer<
  typeof toolStandGripperDistanzialiSchema
>

export const initialState: ToolStandGripperDistanzialiState = {
  kind: 'tool-stand-gripper-distanziali',
  id: 'tool-stand-gripper-distanziali',
  label: 'Gripper dei distanziali',
  parentId: 'tool-stand',
  status: 'idle',
  dx: 50,
  dy: 50,
}
