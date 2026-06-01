import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const speedSoffiatoreSchema = z.object({
  kind: z.literal('speed-soffiatore'),
  id: z.literal('speed-soffiatore'),
  label: z.string(),
  parentId: z.literal('speed'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  accese: z.boolean(),
})
export type SpeedSoffiatoreState = z.infer<typeof speedSoffiatoreSchema>

export function deriveStatus(
  accese: boolean,
  codiceErrori: string[],
): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  return accese ? 'active' : 'idle'
}

export const initialState: SpeedSoffiatoreState = {
  kind: 'speed-soffiatore',
  id: 'speed-soffiatore',
  label: 'Soffiatore',
  parentId: 'speed',
  status: 'idle',
  codiceStato: 'OK',
  codiceErrori: [],
  accese: false,
}
