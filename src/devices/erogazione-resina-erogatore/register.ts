import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterErogazioneResinaErogatore() {
  useEffect(() => {
    useMachineStore
      .getState()
      .setDevice('erogazione-resina-erogatore', initialState)
  }, [])
}
