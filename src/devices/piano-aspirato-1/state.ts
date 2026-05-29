import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

/**
 * Fixed geometric layout for Piano aspirato 1 — values come straight from
 * the machine spec; not part of the state slice (no runtime mutation).
 *
 *  - board:  3720 × 1600 mm
 *  - 5 rows × 12 cols = 60 ventose
 *  - first cup at (40, 40) from the top-left corner
 *  - cup-to-cup pitch: 310 mm horizontally, 320 mm vertically
 *  - each ventosa is 82 mm in diameter
 */
export const VENTOSE_LAYOUT = {
  rows: 5,
  cols: 12,
  total: 60,
  boardDimensions: { width: 3720, height: 1600 },
  firstCup: { x: 40, y: 40 },
  distance: { x: 310, y: 320 },
  cupSize: 82,
} as const

export const ventosaSchema = z.object({
  stato: z.enum(['attiva', 'disattiva']),
  abilitata: z.boolean(),
})
export type VentosaState = z.infer<typeof ventosaSchema>

export const pianoAspirato1Schema = z.object({
  kind: z.literal('piano-aspirato-1'),
  id: z.literal('piano-aspirato-1'),
  label: z.string(),
  parentId: z.literal('piani-aspirati'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  modalita: z.enum(['vuoto', 'soffio']),
  ventose: z.array(ventosaSchema).length(60),
})
export type PianoAspirato1State = z.infer<typeof pianoAspirato1Schema>

export function deriveStatus(codiceErrori: string[]): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  return 'active'
}

/**
 * Per-ventosa stato is derived from (modalità, abilitata): in vuoto the
 * abilitate cups go active; in soffio everything backs off (disactiva);
 * a disabled cup is always disattiva regardless of mode. Idempotent — call
 * after every command that mutates modalità or ventose[i].abilitata so the
 * panel and the badge stay in sync.
 */
export function recomputeVentose(
  ventose: VentosaState[],
  modalita: 'vuoto' | 'soffio',
): VentosaState[] {
  return ventose.map((v) => ({
    ...v,
    stato:
      modalita === 'vuoto' && v.abilitata
        ? 'attiva'
        : 'disattiva',
  }))
}

const initialVentose: VentosaState[] = Array.from(
  { length: VENTOSE_LAYOUT.total },
  () => ({ stato: 'attiva', abilitata: true }),
)

export const initialState: PianoAspirato1State = {
  kind: 'piano-aspirato-1',
  id: 'piano-aspirato-1',
  label: 'Piano aspirato 1',
  parentId: 'piani-aspirati',
  status: 'active',
  codiceStato: 'OK',
  codiceErrori: [],
  modalita: 'vuoto',
  ventose: initialVentose,
}
