import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const erogazioneResinaAlimentatoreInsertiSchema = z.object({
  kind: z.literal('erogazione-resina-alimentatore-inserti'),
  id: z.literal('erogazione-resina-alimentatore-inserti'),
  label: z.string(),
  parentId: z.literal('erogazione-resina'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  /** 1 → flexpin corto, 2 → flexpin lungo (per the machine spec). */
  idFlexpin: z.union([z.literal(1), z.literal(2)]),
  acceso: z.boolean(),
})
export type ErogazioneResinaAlimentatoreInsertiState = z.infer<
  typeof erogazioneResinaAlimentatoreInsertiSchema
>

export const FLEXPIN_LABEL: Record<1 | 2, string> = {
  1: 'Corto',
  2: 'Lungo',
}

export function deriveStatus(
  acceso: boolean,
  codiceErrori: string[],
): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  if (acceso) return 'active'
  return 'idle'
}

export const initialState: ErogazioneResinaAlimentatoreInsertiState = {
  kind: 'erogazione-resina-alimentatore-inserti',
  id: 'erogazione-resina-alimentatore-inserti',
  label: 'Alimentatore inserti',
  parentId: 'erogazione-resina',
  status: 'active',
  codiceStato: 'OK',
  codiceErrori: [],
  idFlexpin: 1,
  acceso: true,
}
