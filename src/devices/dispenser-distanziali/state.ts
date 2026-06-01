import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const PISTONI_COUNT = 6 as const

export const pistoneSchema = z.object({
  /** Cilindro position: avanti = esteso, indietro = retratto. */
  stato: z.enum(['avanti', 'indietro']),
})
export type PistoneState = z.infer<typeof pistoneSchema>

export const dispenserDistanzialiSchema = z.object({
  kind: z.literal('dispenser-distanziali'),
  id: z.literal('dispenser-distanziali'),
  label: z.string(),
  parentId: z.null(),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  idDistanziale: z.string(),
  pistoni: z.array(pistoneSchema).length(PISTONI_COUNT),
})
export type DispenserDistanzialiState = z.infer<
  typeof dispenserDistanzialiSchema
>

export function deriveStatus(
  pistoni: PistoneState[],
  codiceErrori: string[],
): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  const anyExtended = pistoni.some((p) => p.stato === 'avanti')
  return anyExtended ? 'active' : 'idle'
}

const initialPistoni: PistoneState[] = Array.from(
  { length: PISTONI_COUNT },
  () => ({ stato: 'indietro' as const }),
)

export const initialState: DispenserDistanzialiState = {
  kind: 'dispenser-distanziali',
  id: 'dispenser-distanziali',
  label: 'Dispenser',
  parentId: null,
  status: 'idle',
  codiceStato: 'OK',
  codiceErrori: [],
  idDistanziale: 'DST-2.4-AL',
  pistoni: initialPistoni,
}
