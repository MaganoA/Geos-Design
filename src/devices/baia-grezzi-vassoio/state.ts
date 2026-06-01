import { z } from 'zod'

export const baiaGrezziVassoioSchema = z.object({
  kind: z.literal('baia-grezzi-vassoio'),
  id: z.literal('baia-grezzi-vassoio'),
  label: z.string(),
  parentId: z.literal('baia-grezzi'),
  status: z.enum(['active', 'idle', 'warning', 'error', 'offline']),
  idVassoio: z.string(),
})
export type BaiaGrezziVassoioState = z.infer<typeof baiaGrezziVassoioSchema>

export const initialState: BaiaGrezziVassoioState = {
  kind: 'baia-grezzi-vassoio',
  id: 'baia-grezzi-vassoio',
  label: 'Vassoio',
  parentId: 'baia-grezzi',
  status: 'idle',
  idVassoio: 'VAS-G-0142',
}
