import { z } from 'zod'
import type { DeviceStatus } from '@/types/device'

export const erogazioneResinaSerbatoioSchema = z.object({
  kind: z.literal('erogazione-resina-serbatoio'),
  id: z.literal('erogazione-resina-serbatoio'),
  label: z.string(),
  parentId: z.literal('erogazione-resina'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  pressioneOk: z.boolean(),
  /** Resin level as a 0–1 fraction. */
  livello: z.number().min(0).max(1),
  /** Trigger threshold; when livello < limiteMinimo, raise warning. */
  limiteMinimo: z.number().min(0).max(1),
  /** True when the impianto is being actively pressurised. */
  pressurizzazione: z.boolean(),
})
export type ErogazioneResinaSerbatoioState = z.infer<
  typeof erogazioneResinaSerbatoioSchema
>

/**
 * Status priority:
 *  - pressure not ok → error (the dispenser will starve)
 *  - level under threshold → warning (refill soon)
 *  - pressurising → active
 *  - resting → idle
 */
export function deriveStatus(
  pressioneOk: boolean,
  livello: number,
  limiteMinimo: number,
  pressurizzazione: boolean,
): DeviceStatus {
  if (!pressioneOk) return 'error'
  if (livello < limiteMinimo) return 'warning'
  if (pressurizzazione) return 'active'
  return 'idle'
}

export const initialState: ErogazioneResinaSerbatoioState = {
  kind: 'erogazione-resina-serbatoio',
  id: 'erogazione-resina-serbatoio',
  label: 'Serbatoio',
  parentId: 'erogazione-resina',
  status: 'active',
  pressioneOk: true,
  livello: 0.72,
  limiteMinimo: 0.15,
  pressurizzazione: true,
}
