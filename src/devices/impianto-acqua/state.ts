import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const impiantoAcquaSchema = z.object({
  kind: z.literal('impianto-acqua'),
  id: z.literal('impianto-acqua'),
  label: z.string(),
  parentId: z.literal('impianti'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  /** Status code of the internal (closed-loop) water circuit. */
  codiceStatoInterna: z.string(),
  /** Status code of the external (mains/feed) water circuit. */
  codiceStatoEsterna: z.string(),
  codiceErrori: z.array(z.string()),
  accese: z.boolean(),
})
export type ImpiantoAcquaState = z.infer<typeof impiantoAcquaSchema>

export function deriveStatus(
  accese: boolean,
  codiceErrori: string[],
): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  return accese ? 'active' : 'idle'
}

export const initialState: ImpiantoAcquaState = {
  kind: 'impianto-acqua',
  id: 'impianto-acqua',
  label: 'Impianto acqua',
  parentId: 'impianti',
  status: 'idle',
  codiceStatoInterna: 'OK',
  codiceStatoEsterna: 'OK',
  codiceErrori: [],
  accese: false,
}
