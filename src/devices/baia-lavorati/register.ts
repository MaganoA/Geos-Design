import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterBaiaLavorati() {
  useEffect(() => {
    useMachineStore.getState().setDevice('baia-lavorati', initialState)
  }, [])
}
