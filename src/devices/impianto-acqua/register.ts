import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterImpiantoAcqua() {
  useEffect(() => {
    useMachineStore.getState().setDevice('impianto-acqua', initialState)
  }, [])
}
