import { z } from 'zod'
import { lerpToward } from '@/lib/animate-value'

export const tenutaModalita = ['soffio', 'aspirazione', 'niente'] as const
export type TenutaModalita = (typeof tenutaModalita)[number]

export const portaleTesta1TenutaSchema = z.object({
  kind: z.literal('portale-testa-1-tenuta'),
  id: z.literal('portale-testa-1-tenuta'),
  label: z.string(),
  parentId: z.literal('portale-testa-1'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  // Vacuum level as a fraction of full depression (0 = no vacuum, 1 = full).
  livelloDepressione: z.number(),
  // Exclusive command mode for the test rig: aspirazione pulls vacuum,
  // soffio blows positive pressure, niente leaves the line passive.
  modalita: z.enum(tenutaModalita),
})
export type PortaleTesta1TenutaState = z.infer<typeof portaleTesta1TenutaSchema>

export const initialState: PortaleTesta1TenutaState = {
  kind: 'portale-testa-1-tenuta',
  id: 'portale-testa-1-tenuta',
  label: 'Sistema di prova tenuta',
  parentId: 'portale-testa-1',
  status: 'active',
  codiceStato: 'OK',
  codiceErrori: [],
  livelloDepressione: 0.82,
  modalita: 'aspirazione',
}

// Each mode holds the level inside a band that breathes up and down,
// the way a real depression sensor reads while the rig runs: a slow
// sine swing around a centre plus a little sensor jitter. aspirazione
// rides high, soffio low, niente settles near zero.
const BAND: Record<TenutaModalita, { center: number; amp: number }> = {
  aspirazione: { center: 0.78, amp: 0.18 }, // ~0.60–0.96
  soffio: { center: 0.15, amp: 0.1 }, // ~0.05–0.25
  niente: { center: 0.05, amp: 0.04 }, // ~0.01–0.09
}
const OSC_PERIOD_S = 5 // one full up-and-down swing
const TRACK_RATE = 0.6 // how fast the level chases its moving setpoint
const JITTER = 0.02 // peak-to-peak sensor noise

// Module-scoped phase: survives across ticks (only one tenuta in the
// system) so the swing is continuous rather than reset every frame.
let phaseS = 0

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

export function applyTick(
  prev: PortaleTesta1TenutaState,
  dtMs: number,
): PortaleTesta1TenutaState {
  phaseS += dtMs / 1000
  const { center, amp } = BAND[prev.modalita]
  const wobble = Math.sin((phaseS / OSC_PERIOD_S) * Math.PI * 2)
  const jitter = (Math.random() - 0.5) * JITTER
  const target = clamp01(center + amp * wobble + jitter)
  const livelloDepressione = clamp01(
    lerpToward(prev.livelloDepressione, target, TRACK_RATE, dtMs),
  )
  return { ...prev, livelloDepressione }
}
