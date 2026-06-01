import { z } from 'zod'

export const baiaLavoratiVassoioSchema = z.object({
  kind: z.literal('baia-lavorati-vassoio'),
  id: z.literal('baia-lavorati-vassoio'),
  label: z.string(),
  parentId: z.literal('baia-lavorati'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  idVassoio: z.string(),
})
export type BaiaLavoratiVassoioState = z.infer<
  typeof baiaLavoratiVassoioSchema
>

export const initialState: BaiaLavoratiVassoioState = {
  kind: 'baia-lavorati-vassoio',
  id: 'baia-lavorati-vassoio',
  label: 'Vassoio',
  parentId: 'baia-lavorati',
  status: 'idle',
  idVassoio: 'VAS-L-0091',
}
