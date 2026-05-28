import { z } from 'zod'
import { lerpToward } from '@/lib/animate-value'

export const portaleTesta2Schema = z.object({
  kind: z.literal('portale-testa-2'),
  id: z.literal('portale-testa-2'),
  label: z.string(),
  parentId: z.literal('portale'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  mode: z.enum(['operativa', 'riposo-1', 'riposo-2']),
  codiceStato: z.string().optional(),
  codiceErrori: z.array(z.string()).optional(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  positionTarget: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  lavorazione: z
    .object({
      idLavoro: z.string(),
      idLavorazione: z.string(),
      idLastra: z.string(),
      indiceForo: z.string(),
      inizio: z.number(),
      finePrec: z.number().nullable(),
    })
    .nullable(),
})
export type PortaleTesta2State = z.infer<typeof portaleTesta2Schema>

export const initialState: PortaleTesta2State = {
  kind: 'portale-testa-2',
  id: 'portale-testa-2',
  label: 'Testa 2',
  parentId: 'portale',
  status: 'active',
  mode: 'operativa',
  codiceStato: 'OK',
  codiceErrori: [],
  position: { x: 2236.0, y: 514.2, z: 92.0 },
  positionTarget: { x: 2236.0, y: 514.2, z: 92.0 },
  lavorazione: {
    idLavoro: 'JOB-0431',
    idLavorazione: 'LAV-2403-05',
    idLastra: 'L-2403-118',
    indiceForo: 'F-009',
    inizio: Date.now() - 8 * 60 * 1000,
    finePrec: Date.now() - 18 * 60 * 1000,
  },
}

// Tick-local accumulators (module-scope: only one Testa 2 exists).
let secsSinceTargetRoll = 0
let secsSinceForoBump = 0
const RATE_MM_PER_SEC = 18

export function applyTick(prev: PortaleTesta2State, dtMs: number): PortaleTesta2State {
  const dt = dtMs / 1000
  secsSinceTargetRoll += dt
  secsSinceForoBump += dt

  let posT = prev.positionTarget
  if (prev.mode === 'operativa' && secsSinceTargetRoll >= 4) {
    secsSinceTargetRoll = 0
    posT = {
      x: prev.position.x + (Math.random() - 0.5) * 4,
      y: prev.position.y + (Math.random() - 0.5) * 4,
      z: prev.position.z + (Math.random() - 0.5) * 1,
    }
  }
  const position = {
    x: lerpToward(prev.position.x, posT.x, RATE_MM_PER_SEC, dtMs),
    y: lerpToward(prev.position.y, posT.y, RATE_MM_PER_SEC, dtMs),
    z: lerpToward(prev.position.z, posT.z, RATE_MM_PER_SEC, dtMs),
  }

  let lavorazione = prev.lavorazione
  if (lavorazione && secsSinceForoBump >= 12) {
    secsSinceForoBump = 0
    const n = Number(lavorazione.indiceForo.replace('F-', ''))
    lavorazione = {
      ...lavorazione,
      indiceForo: `F-${String(n + 1).padStart(3, '0')}`,
    }
  }

  return {
    ...prev,
    position,
    positionTarget: posT,
    lavorazione,
  }
}
