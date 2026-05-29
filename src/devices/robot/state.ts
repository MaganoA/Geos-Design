import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

/**
 * Six-axis articulated robot: the six joints carry the arm; `distanza`
 * is the linear extension along the gantry that positions the arm in
 * front of a station (piano aspirato, baie). The two readings together
 * fully describe pose for the HMI panel.
 */
export const ANGOLI_COUNT = 6

export const robotSchema = z.object({
  kind: z.literal('robot'),
  id: z.literal('robot'),
  label: z.string(),
  parentId: z.null(),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  codiceStato: z.string(),
  codiceErrori: z.array(z.string()),
  /** Joint angles in degrees, J1…J6. */
  angoli: z.array(z.number()).length(ANGOLI_COUNT),
  /** Linear travel along the gantry rail, mm. */
  distanza: z.number(),
})
export type RobotState = z.infer<typeof robotSchema>

export function deriveStatus(codiceErrori: string[]): DeviceStatus {
  return codiceErrori.length > 0 ? 'error' : 'active'
}

export const initialState: RobotState = {
  kind: 'robot',
  id: 'robot',
  label: 'Robot',
  parentId: null,
  status: 'active',
  codiceStato: 'OK',
  codiceErrori: [],
  angoli: [0, 0, 0, 0, 0, 0],
  distanza: 0,
}
