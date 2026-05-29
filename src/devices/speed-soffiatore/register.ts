import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterSpeedSoffiatore() {
  useEffect(() => {
    useMachineStore.getState().setDevice('speed-soffiatore', initialState)
  }, [])
}
