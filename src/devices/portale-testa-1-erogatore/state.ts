import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const erogatoreStato = ['aperto', 'chiuso'] as const
export type ErogatoreStato = (typeof erogatoreStato)[number]

export const portaleTesta1ErogatoreSchema = z.object({
  kind: z.literal('portale-testa-1-erogatore'),
  id: z.literal('portale-testa-1-erogatore'),
  label: z.string(),
  parentId: z.literal('portale-testa-1'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  // Dispenser valve, coupled to the purge (the valve opens during a
  // purge cycle so the compressed air can vent through the nozzle).
  stato: z.enum(erogatoreStato),
  // Purge cycle currently running.
  spurgoAttivo: z.boolean(),
  // Compressed-air supply switch. Independent of the purge: you can
  // pressurise the line without running a purge, and vice versa.
  ariaCompressaAttiva: z.boolean(),
})
export type PortaleTesta1ErogatoreState = z.infer<
  typeof portaleTesta1ErogatoreSchema
>

/**
 * Badge status priority:
 *  - purge running → warning (active operation, attention)
 *  - compressed air on (no purge) → active (line armed, ready)
 *  - everything off → idle
 */
export function deriveStatus(
  spurgoAttivo: boolean,
  ariaCompressaAttiva: boolean,
): DeviceStatus {
  if (spurgoAttivo) return 'warning'
  if (ariaCompressaAttiva) return 'active'
  return 'idle'
}

export const initialState: PortaleTesta1ErogatoreState = {
  kind: 'portale-testa-1-erogatore',
  id: 'portale-testa-1-erogatore',
  label: 'Erogatore',
  parentId: 'portale-testa-1',
  status: 'idle',
  stato: 'chiuso',
  spurgoAttivo: false,
  ariaCompressaAttiva: false,
}
