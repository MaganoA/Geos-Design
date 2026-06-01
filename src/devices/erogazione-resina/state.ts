import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const erogazioneResinaSchema = z.object({
  kind: z.literal('erogazione-resina'),
  id: z.literal('erogazione-resina'),
  label: z.string(),
  parentId: z.null(),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  pressioneOk: z.boolean(),
  idResina: z.string(),
})
export type ErogazioneResinaState = z.infer<typeof erogazioneResinaSchema>

/**
 * Pressure drop on the resin line is a hard fail — the dispensing
 * heads can run dry. Surface it as error even without an error code,
 * so the badge stays loud.
 */
export function deriveStatus(
  pressioneOk: boolean,
  codiceErrori: string[],
): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  if (!pressioneOk) return 'error'
  return 'active'
}

export const initialState: ErogazioneResinaState = {
  kind: 'erogazione-resina',
  id: 'erogazione-resina',
  label: 'Sistema di erogazione resina',
  parentId: null,
  status: 'active',
  codiceStato: 'OK',
  codiceErrori: [],
  pressioneOk: true,
  idResina: 'RES-EPX-228',
}
