import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterImpiantoVuoto() {
  useEffect(() => {
    useMachineStore.getState().setDevice('impianto-vuoto', initialState)
  }, [])
}
