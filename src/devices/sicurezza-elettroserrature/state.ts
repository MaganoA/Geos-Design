import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const sicurezzaElettroserratureSchema = z.object({
  kind: z.literal('sicurezza-elettroserrature'),
  id: z.literal('sicurezza-elettroserrature'),
  label: z.string(),
  parentId: z.literal('sicurezza'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
})
export type SicurezzaElettroserratureState = z.infer<
  typeof sicurezzaElettroserratureSchema
>

/**
 * Electronic door locks: when no error code is reported, the device is
 * holding the safety interlock and the badge shows Attivo. Any error
 * raises Errore so the operator notices immediately.
 */
export function deriveStatus(codiceErrori: string[]): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  return 'active'
}

export const initialState: SicurezzaElettroserratureState = {
  kind: 'sicurezza-elettroserrature',
  id: 'sicurezza-elettroserrature',
  label: 'Elettroserrature',
  parentId: 'sicurezza',
  status: 'active',
  codiceStato: 'OK',
  codiceErrori: [],
}
