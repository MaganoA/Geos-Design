import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const baiaGrezziTastatoreSchema = z.object({
  kind: z.literal('baia-grezzi-tastatore'),
  id: z.literal('baia-grezzi-tastatore'),
  label: z.string(),
  parentId: z.literal('baia-grezzi'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  /** Laser distance reads (mm) — two on the long alignator, one each
   * on the side alignators. Updated on tick. */
  laser: z.object({
    lungo1: z.number(),
    lungo2: z.number(),
    sinistra: z.number(),
    destra: z.number(),
  }),
})
export type BaiaGrezziTastatoreState = z.infer<
  typeof baiaGrezziTastatoreSchema
>

export function deriveStatus(
  codiceErrori: string[],
): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  return 'active'
}

export const initialState: BaiaGrezziTastatoreState = {
  kind: 'baia-grezzi-tastatore',
  id: 'baia-grezzi-tastatore',
  label: 'Tastatore',
  parentId: 'baia-grezzi',
  status: 'active',
  codiceStato: 'OK',
  codiceErrori: [],
  laser: {
    lungo1: 124.6,
    lungo2: 125.1,
    sinistra: 86.4,
    destra: 86.7,
  },
}

/**
 * Tiny ± drift on each laser read so the right-panel values feel live.
 * Amplitudes kept small (0.15 mm) — the lasers measure rigid plates,
 * not a moving target.
 */
export function applyTick(prev: BaiaGrezziTastatoreState): BaiaGrezziTastatoreState {
  const wobble = () => (Math.random() - 0.5) * 0.3
  return {
    ...prev,
    laser: {
      lungo1: round1(prev.laser.lungo1 + wobble()),
      lungo2: round1(prev.laser.lungo2 + wobble()),
      sinistra: round1(prev.laser.sinistra + wobble()),
      destra: round1(prev.laser.destra + wobble()),
    },
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}
