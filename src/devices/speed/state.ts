import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const speedSchema = z.object({
  kind: z.literal('speed'),
  id: z.literal('speed'),
  label: z.string(),
  parentId: z.null(),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  dataOra: z.number(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  positionTarget: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  velocitaRelazionale: z.number(),
  angoloAsseC: z.number(),
  angoloRalla: z.number(),
  utensileConnesso: z.string(),
  ultimoUtensileDisponibile: z.string(),
})
export type SpeedState = z.infer<typeof speedSchema>

/**
 * Badge priority:
 *  - any active error code wins
 *  - otherwise, if the connected tool matches the last-available marker
 *    (i.e. nothing left to swap to after this one) → warning
 *  - else active
 */
export function deriveStatus(
  utensileConnesso: string,
  ultimoUtensileDisponibile: string,
  codiceErrori: string[],
): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  if (utensileConnesso === ultimoUtensileDisponibile) return 'warning'
  return 'active'
}

export const initialState: SpeedState = {
  kind: 'speed',
  id: 'speed',
  label: 'Speed',
  parentId: null,
  status: 'active',
  codiceStato: 'OK',
  codiceErrori: [],
  dataOra: Date.now(),
  position: { x: 1750.0, y: 250.0, z: 80.0 },
  positionTarget: { x: 1750.0, y: 250.0, z: 80.0 },
  velocitaRelazionale: 250,
  angoloAsseC: 0,
  angoloRalla: 0,
  utensileConnesso: 'T07',
  ultimoUtensileDisponibile: 'T12',
}

// Tick-local accumulators (module scope: only one Speed device exists).
let phaseS = 0
const C_DEG_PER_SEC = 30 // continuous asse C rotation
const RALLA_DEG_PER_SEC = 15 // ralla a metà velocità rispetto all'asse C
const VEL_CENTER = 250
const VEL_AMP = 35 // mm/s peak-to-peak ≈ 70
const VEL_PERIOD_S = 6
const VEL_JITTER = 4 // small noise on top of the sine

const wrap360 = (n: number) => ((n % 360) + 360) % 360

export function applyTick(prev: SpeedState, dtMs: number): SpeedState {
  const dt = dtMs / 1000
  phaseS += dt

  // angoli sempre in moto continuo
  const angoloAsseC = wrap360(prev.angoloAsseC + C_DEG_PER_SEC * dt)
  const angoloRalla = wrap360(prev.angoloRalla + RALLA_DEG_PER_SEC * dt)

  // velocità relazionale: sine attorno al centro + piccolo jitter
  const wobble = Math.sin((phaseS / VEL_PERIOD_S) * Math.PI * 2)
  const jitter = (Math.random() - 0.5) * VEL_JITTER * 2
  const velocitaRelazionale = VEL_CENTER + VEL_AMP * wobble + jitter

  return {
    ...prev,
    dataOra: Date.now(),
    angoloAsseC,
    angoloRalla,
    velocitaRelazionale,
  }
}
