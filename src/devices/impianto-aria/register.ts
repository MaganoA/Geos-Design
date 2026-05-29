import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterImpiantoAria() {
  useEffect(() => {
    useMachineStore.getState().setDevice('impianto-aria', initialState)
  }, [])
}
