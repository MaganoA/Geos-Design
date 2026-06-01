import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterBaiaGrezziVassoio() {
  useEffect(() => {
    useMachineStore.getState().setDevice('baia-grezzi-vassoio', initialState)
  }, [])
}
