import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const impiantoAriaSchema = z.object({
  kind: z.literal('impianto-aria'),
  id: z.literal('impianto-aria'),
  label: z.string(),
  parentId: z.literal('impianti'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  accese: z.boolean(),
})
export type ImpiantoAriaState = z.infer<typeof impiantoAriaSchema>

export function deriveStatus(
  accese: boolean,
  codiceErrori: string[],
): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  return accese ? 'active' : 'idle'
}

export const initialState: ImpiantoAriaState = {
  kind: 'impianto-aria',
  id: 'impianto-aria',
  label: 'Impianto aria',
  parentId: 'impianti',
  status: 'idle',
  codiceStato: 'OK',
  codiceErrori: [],
  accese: false,
}
