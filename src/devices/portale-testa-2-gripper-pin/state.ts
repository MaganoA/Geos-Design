import { z } from 'zod'
import { lerpToward } from '@/lib/animate-value'
import type { DeviceStatus } from '@/types/device'

export const gripperStato = ['aperto', 'chiuso'] as const
export type GripperStato = (typeof gripperStato)[number]

export const portaleTesta2GripperPinSchema = z.object({
  kind: z.literal('portale-testa-2-gripper-pin'),
  id: z.literal('portale-testa-2-gripper-pin'),
  label: z.string(),
  parentId: z.literal('portale-testa-2'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  stato: z.enum(gripperStato),
  angolo: z.number(),
  angoloDestinazione: z.number(),
  inRotazione: z.boolean(),
})
export type PortaleTesta2GripperPinState = z.infer<
  typeof portaleTesta2GripperPinSchema
>

const ROTATION_RATE_DEG_PER_SEC = 30

/**
 * inRotazione → warning (motore in moto).
 * aperto + !inRotazione → active (ganasce aperte e ferme).
 * chiuso + !inRotazione → idle (a riposo).
 */
export function deriveStatus(
  inRotazione: boolean,
  stato: GripperStato,
): DeviceStatus {
  if (inRotazione) return 'warning'
  return stato === 'aperto' ? 'active' : 'idle'
}

export const initialState: PortaleTesta2GripperPinState = {
  kind: 'portale-testa-2-gripper-pin',
  id: 'portale-testa-2-gripper-pin',
  label: 'Gripper dei pin',
  parentId: 'portale-testa-2',
  status: 'idle',
  codiceStato: 'OK',
  codiceErrori: [],
  stato: 'chiuso',
  angolo: 0,
  angoloDestinazione: 0,
  inRotazione: false,
}

export function applyTick(
  prev: PortaleTesta2GripperPinState,
  dtMs: number,
): PortaleTesta2GripperPinState {
  if (!prev.inRotazione) return prev
  const angolo = lerpToward(
    prev.angolo,
    prev.angoloDestinazione,
    ROTATION_RATE_DEG_PER_SEC,
    dtMs,
  )
  const reached = angolo === prev.angoloDestinazione
  const inRotazione = reached ? false : true
  return {
    ...prev,
    angolo,
    inRotazione,
    status: deriveStatus(inRotazione, prev.stato),
  }
}
