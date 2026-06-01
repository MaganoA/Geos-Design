import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const baiaGrezziFotocelluleSchema = z.object({
  kind: z.literal('baia-grezzi-fotocellule'),
  id: z.literal('baia-grezzi-fotocellule'),
  label: z.string(),
  parentId: z.literal('baia-grezzi'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  /** Physical state of the safety light curtain. */
  stato: z.enum(['attiva', 'disattiva', 'interrotta']),
})
export type BaiaGrezziFotocelluleState = z.infer<
  typeof baiaGrezziFotocelluleSchema
>

/**
 * `interrotta` means the beam was broken (intrusion) — surface it as a
 * warning so the right-panel badge draws attention even if no error code
 * was raised upstream. `disattiva` is the maintenance-bypassed state.
 */
export function deriveStatus(
  stato: BaiaGrezziFotocelluleState['stato'],
): DeviceStatus {
  if (stato === 'interrotta') return 'warning'
  if (stato === 'disattiva') return 'idle'
  return 'active'
}

export const initialState: BaiaGrezziFotocelluleState = {
  kind: 'baia-grezzi-fotocellule',
  id: 'baia-grezzi-fotocellule',
  label: 'Fotocellule',
  parentId: 'baia-grezzi',
  status: 'active',
  stato: 'attiva',
}
