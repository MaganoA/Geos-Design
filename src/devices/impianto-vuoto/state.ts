import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const impiantoVuotoSchema = z.object({
  kind: z.literal('impianto-vuoto'),
  id: z.literal('impianto-vuoto'),
  label: z.string(),
  parentId: z.literal('impianti'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  /** Master switch for the whole vacuum system. */
  accese: z.boolean(),
  /** Individual pump enable flags; only meaningful when accese=true. */
  pompa1Attiva: z.boolean(),
  pompa2Attiva: z.boolean(),
})
export type ImpiantoVuotoState = z.infer<typeof impiantoVuotoSchema>

/**
 * Status priority:
 *  - any error code → error
 *  - master off → idle
 *  - master on, no pumps → idle (system armed but not drawing vacuum)
 *  - master on, ≥1 pump → active (live vacuum)
 */
export function deriveStatus(
  accese: boolean,
  pompa1Attiva: boolean,
  pompa2Attiva: boolean,
  codiceErrori: string[],
): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  if (!accese) return 'idle'
  if (pompa1Attiva || pompa2Attiva) return 'active'
  return 'idle'
}

export const initialState: ImpiantoVuotoState = {
  kind: 'impianto-vuoto',
  id: 'impianto-vuoto',
  label: 'Impianto del vuoto',
  parentId: 'impianti',
  status: 'idle',
  codiceStato: 'OK',
  codiceErrori: [],
  accese: false,
  pompa1Attiva: false,
  pompa2Attiva: false,
}
