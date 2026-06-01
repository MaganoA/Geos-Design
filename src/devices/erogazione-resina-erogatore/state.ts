import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const erogazioneResinaErogatoreSchema = z.object({
  kind: z.literal('erogazione-resina-erogatore'),
  id: z.literal('erogazione-resina-erogatore'),
  label: z.string(),
  parentId: z.literal('erogazione-resina'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  stato: z.enum(['aperto', 'chiuso']),
  /** Compressed air on means spurgo is in flight (dispenser is being
   * purged). */
  ariaCompressa: z.boolean(),
})
export type ErogazioneResinaErogatoreState = z.infer<
  typeof erogazioneResinaErogatoreSchema
>

/**
 * Status priority:
 *  - aria compressa on → warning (spurgo in corso; operator should be watching)
 *  - aperto → active (dispensing)
 *  - chiuso → idle
 */
export function deriveStatus(
  stato: 'aperto' | 'chiuso',
  ariaCompressa: boolean,
): DeviceStatus {
  if (ariaCompressa) return 'warning'
  if (stato === 'aperto') return 'active'
  return 'idle'
}

export const initialState: ErogazioneResinaErogatoreState = {
  kind: 'erogazione-resina-erogatore',
  id: 'erogazione-resina-erogatore',
  label: 'Erogatore',
  parentId: 'erogazione-resina',
  status: 'idle',
  stato: 'chiuso',
  ariaCompressa: false,
}
