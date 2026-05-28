import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const slittaPosizione = ['alta', 'bassa'] as const
export type SlittaPosizione = (typeof slittaPosizione)[number]

export const portaleTesta2LampadeUvSchema = z.object({
  kind: z.literal('portale-testa-2-lampade-uv'),
  id: z.literal('portale-testa-2-lampade-uv'),
  label: z.string(),
  parentId: z.literal('portale-testa-2'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  accese: z.boolean(),
  intensita: z.number(),
  slittaPosizione: z.enum(slittaPosizione),
})
export type PortaleTesta2LampadeUvState = z.infer<
  typeof portaleTesta2LampadeUvSchema
>

/**
 * Errors win the priority. Otherwise: lamps emitting → active; everything
 * else → idle. (warning is reserved for richer device health overlays.)
 */
export function deriveStatus(
  accese: boolean,
  intensita: number,
  codiceErrori: string[],
): DeviceStatus {
  if (codiceErrori.length > 0) return 'error'
  if (accese && intensita > 0) return 'active'
  return 'idle'
}

export const initialState: PortaleTesta2LampadeUvState = {
  kind: 'portale-testa-2-lampade-uv',
  id: 'portale-testa-2-lampade-uv',
  label: 'Lampade UV',
  parentId: 'portale-testa-2',
  status: 'idle',
  codiceStato: 'OK',
  codiceErrori: [],
  accese: false,
  intensita: 0,
  slittaPosizione: 'alta',
}
