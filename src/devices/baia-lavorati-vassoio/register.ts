import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterBaiaLavoratiVassoio() {
  useEffect(() => {
    useMachineStore.getState().setDevice('baia-lavorati-vassoio', initialState)
  }, [])
}
