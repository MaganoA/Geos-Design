import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const speedBarraLavaggioSchema = z.object({
  kind: z.literal('speed-barra-lavaggio'),
  id: z.literal('speed-barra-lavaggio'),
  label: z.string(),
  parentId: z.literal('speed'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  accese: z.boolean(),
})
export type SpeedBarraLavaggioState = z.infer<
  typeof speedBarraLavaggioSchema
>

export function deriveStatus(
  accese: boolean,
  codiceErrori: string[],
): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  return accese ? 'active' : 'idle'
}

export const initialState: SpeedBarraLavaggioState = {
  kind: 'speed-barra-lavaggio',
  id: 'speed-barra-lavaggio',
  label: 'Barra di lavaggio',
  parentId: 'speed',
  status: 'idle',
  codiceStato: 'OK',
  codiceErrori: [],
  accese: false,
}
