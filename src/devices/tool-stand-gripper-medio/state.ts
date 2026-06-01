import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const gripperStati = [
  'a-magazzino',
  'vuoto',
  'soffio',
  'niente',
] as const
export type GripperStato = (typeof gripperStati)[number]

/**
 * A suction valve on the gripper. Spec lists `attiva` and `disattiva`
 * as Bool Write — modelled here as a single `attiva` boolean (the two
 * names from the spec are just the two transitions of the same field).
 */
export const valvolaSchema = z.object({
  attiva: z.boolean(),
})
export type ValvolaState = z.infer<typeof valvolaSchema>

export const VALVE_COUNT = 4

export const toolStandGripperPiccoloSchema = z.object({
  kind: z.literal('tool-stand-gripper-medio'),
  id: z.literal('tool-stand-gripper-medio'),
  label: z.string(),
  parentId: z.literal('tool-stand'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  /**
   * When parked on the rack → 'a-magazzino'. When mounted on the robot
   * head, the suction subsystem can be in one of three operating
   * modalities: 'vuoto' / 'soffio' / 'niente'.
   */
  stato: z.enum(gripperStati),
  /** Apertura — mm on the X axis. */
  dx: z.number(),
  /** Apertura — mm on the Y axis. */
  dy: z.number(),
  ventose: z.array(valvolaSchema).length(VALVE_COUNT),
})
export type ToolStandGripperumedioState = z.infer<
  typeof toolStandGripperPiccoloSchema
>

export function deriveStatus(stato: GripperStato): DeviceStatus {
  return stato === 'a-magazzino' ? 'idle' : 'active'
}

export const initialState: ToolStandGripperumedioState = {
  kind: 'tool-stand-gripper-medio',
  id: 'tool-stand-gripper-medio',
  label: 'Gripper medio',
  parentId: 'tool-stand',
  status: 'idle',
  stato: 'a-magazzino',
  dx: 90,
  dy: 90,
  ventose: Array.from({ length: VALVE_COUNT }, () => ({ attiva: false })),
}
