import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterErogazioneResinaSerbatoio() {
  useEffect(() => {
    useMachineStore
      .getState()
      .setDevice('erogazione-resina-serbatoio', initialState)
  }, [])
}
