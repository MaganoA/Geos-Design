import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

/**
 * Piano 2 shares the canonical 5×12 vacuum-cup layout of Piano 1. The
 * spec doesn't list per-pitch geometry for Piano 2, so we reuse the
 * Piano 1 constants and keep board dimensions consistent.
 */
export const VENTOSE_LAYOUT = {
  rows: 5,
  cols: 12,
  total: 60,
  boardDimensions: { width: 3720, height: 1600 },
} as const

export const ventosaSchema = z.object({
  stato: z.enum(['attiva', 'disattiva']),
  abilitata: z.boolean(),
})
export type VentosaState = z.infer<typeof ventosaSchema>

export const pianoAspirato2Schema = z.object({
  kind: z.literal('piano-aspirato-2'),
  id: z.literal('piano-aspirato-2'),
  label: z.string(),
  parentId: z.literal('piani-aspirati'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  modalita: z.enum(['vuoto', 'soffio']),
  ventose: z.array(ventosaSchema).length(60),
  // IDs of "lastre" the by-pass procedure marked for skipping. Empty
  // when no by-pass is active.
  lastreBypass: z.array(z.string()),
})
export type PianoAspirato2State = z.infer<typeof pianoAspirato2Schema>

export function deriveStatus(codiceErrori: string[]): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  return 'active'
}

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

export const initialState: PianoAspirato2State = {
  kind: 'piano-aspirato-2',
  id: 'piano-aspirato-2',
  label: 'Piano aspirato 2',
  parentId: 'piani-aspirati',
  status: 'active',
  codiceStato: 'OK',
  codiceErrori: [],
  modalita: 'vuoto',
  ventose: initialVentose,
  lastreBypass: [],
}
