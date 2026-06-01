import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const lastraSchema = z.object({
  id: z.string(),
  dimensioni: z.object({
    altezza: z.number(),
    larghezza: z.number(),
    spessoreIniziale: z.number(),
  }),
  posizione: z.object({ x: z.number(), y: z.number() }),
})
export type Lastra = z.infer<typeof lastraSchema>

export const baiaLavoratiSchema = z.object({
  kind: z.literal('baia-lavorati'),
  id: z.literal('baia-lavorati'),
  label: z.string(),
  parentId: z.literal('baie'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  lastre: z.array(lastraSchema),
})
export type BaiaLavoratiState = z.infer<typeof baiaLavoratiSchema>

export function deriveStatus(
  numLastre: number,
  codiceErrori: string[],
): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  if (numLastre === 0) return 'idle'
  return 'active'
}

export const initialState: BaiaLavoratiState = {
  kind: 'baia-lavorati',
  id: 'baia-lavorati',
  label: 'Baia dei lavorati',
  parentId: 'baie',
  status: 'active',
  codiceStato: 'OK',
  codiceErrori: [],
  lastre: [
    {
      id: 'L-2403-114',
      dimensioni: { altezza: 600, larghezza: 400, spessoreIniziale: 8.2 },
      posizione: { x: 60, y: 60 },
    },
    {
      id: 'L-2403-115',
      dimensioni: { altezza: 600, larghezza: 400, spessoreIniziale: 8.2 },
      posizione: { x: 470, y: 60 },
    },
  ],
}
