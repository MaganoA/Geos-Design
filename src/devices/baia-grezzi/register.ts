import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterBaiaGrezzi() {
  useEffect(() => {
    useMachineStore.getState().setDevice('baia-grezzi', initialState)
  }, [])
}
