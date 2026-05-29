import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterSpeedBarraLavaggio() {
  useEffect(() => {
    useMachineStore.getState().setDevice('speed-barra-lavaggio', initialState)
  }, [])
}
