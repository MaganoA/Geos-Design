import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const gripperKinds = ['piccolo', 'medio', 'grande', 'distanziali'] as const
export type GripperKind = (typeof gripperKinds)[number]

/** Conceptual gripper → registered device id. Shared by the tool-stand
 * commands (preleva/posa) and the robot panel (mount CTA + navigate
 * link), so the mapping has one source of truth. */
export const GRIPPER_DEVICE_ID: Record<GripperKind, string> = {
  piccolo: 'tool-stand-gripper-piccolo',
  medio: 'tool-stand-gripper-medio',
  grande: 'tool-stand-gripper-grande',
  distanziali: 'tool-stand-gripper-distanziali',
}

export const GRIPPER_LABEL: Record<GripperKind, string> = {
  piccolo: 'Gripper piccolo',
  medio: 'Gripper medio',
  grande: 'Gripper grande',
  distanziali: 'Gripper dei distanziali',
}

export const toolStandSchema = z.object({
  kind: z.literal('tool-stand'),
  id: z.literal('tool-stand'),
  label: z.string(),
  parentId: z.null(),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  /** Currently-mounted gripper (null = magazzino, every slot occupied). */
  gripperMontato: z.union([z.enum(gripperKinds), z.null()]),
})
export type ToolStandState = z.infer<typeof toolStandSchema>

export function deriveStatus(
  gripperMontato: GripperKind | null,
): DeviceStatus {
  return gripperMontato === null ? 'idle' : 'active'
}

export const initialState: ToolStandState = {
  kind: 'tool-stand',
  id: 'tool-stand',
  label: 'Tool stand',
  parentId: null,
  status: 'idle',
  gripperMontato: null,
}
