import { z } from 'zod'
import { lerpToward } from '@/lib/animate-value'

export const portaleTesta1Schema = z.object({
  kind: z.literal('portale-testa-1'),
  id: z.literal('portale-testa-1'),
  label: z.string(),
  parentId: z.string().nullable(),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string().optional(),
  codiceErrori: z.array(z.string()).optional(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  positionTarget: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  lavorazione: z
    .object({
      idLavoro: z.string(),
      idLastra: z.string(),
      indiceForo: z.string(),
      inizio: z.number(),
      finePrec: z.number().nullable(),
    })
    .nullable(),
  tenuta: z.object({
    codiceStato: z.string(),
    livelloDepressione: z.number(),
    modalita: z.enum(['soffio', 'aspirazione', 'niente']),
  }),
  erogatore: z.object({
    stato: z.enum(['aperto', 'chiuso']),
  }),
})
export type PortaleTesta1State = z.infer<typeof portaleTesta1Schema>

export const initialState: PortaleTesta1State = {
  kind: 'portale-testa-1',
  id: 'portale-testa-1',
  label: 'Testa 1',
  parentId: 'portale',
  status: 'active',
  position: { x: 1264.0, y: 514.2, z: 92.0 },
  positionTarget: { x: 1264.0, y: 514.2, z: 92.0 },
  lavorazione: {
    idLavoro: 'JOB-0430',
    idLastra: 'L-2403-117',
    indiceForo: 'F-023',
    inizio: Date.now(),
    finePrec: null,
  },
  tenuta: { codiceStato: 'OK', livelloDepressione: 0.82, modalita: 'aspirazione' },
  erogatore: { stato: 'chiuso' },
}

// Tick-local accumulators. Module scope so they survive across ticks but
// don't pollute the immutable state snapshot. Resetting them per device
// instance isn't needed — only one Portale Testa 1 in the system.
let secsSinceTargetRoll = 0
let secsSinceForoBump = 0
const RATE_MM_PER_SEC = 18

export function applyTick(prev: PortaleTesta1State, dtMs: number): PortaleTesta1State {
  const dt = dtMs / 1000
  secsSinceTargetRoll += dt
  secsSinceForoBump += dt

  let posT = prev.positionTarget
  if (secsSinceTargetRoll >= 4) {
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

  const livello = Math.max(
    0.4,
    Math.min(1, prev.tenuta.livelloDepressione + (Math.random() - 0.5) * 0.04),
  )

  return {
    ...prev,
    position,
    positionTarget: posT,
    lavorazione,
    tenuta: { ...prev.tenuta, livelloDepressione: livello },
  }
}
