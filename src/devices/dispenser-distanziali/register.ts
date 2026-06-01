import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterDispenserDistanziali() {
  useEffect(() => {
    useMachineStore.getState().setDevice('dispenser-distanziali', initialState)
  }, [])
}
