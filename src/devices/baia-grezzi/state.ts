import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const lastraSchema = z.object({
  id: z.string(),
  dimensioni: z.object({
    altezza: z.number(),
    larghezza: z.number(),
    spessoreIniziale: z.number(),
  }),
  /** Position on the vassoio in mm, origin top-left. */
  posizione: z.object({ x: z.number(), y: z.number() }),
})
export type Lastra = z.infer<typeof lastraSchema>

export const baiaGrezziSchema = z.object({
  kind: z.literal('baia-grezzi'),
  id: z.literal('baia-grezzi'),
  label: z.string(),
  parentId: z.literal('baie'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  vassoioPresente: z.boolean(),
  barriereAttive: z.boolean(),
  lastre: z.array(lastraSchema),
})
export type BaiaGrezziState = z.infer<typeof baiaGrezziSchema>

/**
 * Status priority:
 *  - any error code → error
 *  - barriers down (someone could reach in) → warning
 *  - no vassoio → idle (nothing to do)
 *  - vassoio present, lastre loaded → active
 */
export function deriveStatus(
  vassoioPresente: boolean,
  barriereAttive: boolean,
  numLastre: number,
  codiceErrori: string[],
): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  if (!barriereAttive) return 'warning'
  if (!vassoioPresente) return 'idle'
  if (numLastre === 0) return 'idle'
  return 'active'
}

export const initialState: BaiaGrezziState = {
  kind: 'baia-grezzi',
  id: 'baia-grezzi',
  label: 'Baia dei grezzi',
  parentId: 'baie',
  status: 'active',
  codiceStato: 'OK',
  codiceErrori: [],
  vassoioPresente: true,
  barriereAttive: true,
  lastre: [
    {
      id: 'L-2403-117',
      dimensioni: { altezza: 600, larghezza: 400, spessoreIniziale: 8.2 },
      posizione: { x: 60, y: 60 },
    },
    {
      id: 'L-2403-118',
      dimensioni: { altezza: 600, larghezza: 400, spessoreIniziale: 8.2 },
      posizione: { x: 470, y: 60 },
    },
    {
      id: 'L-2403-119',
      dimensioni: { altezza: 600, larghezza: 400, spessoreIniziale: 8.2 },
      posizione: { x: 60, y: 720 },
    },
    {
      id: 'L-2403-120',
      dimensioni: { altezza: 600, larghezza: 400, spessoreIniziale: 8.2 },
      posizione: { x: 470, y: 720 },
    },
  ],
}
