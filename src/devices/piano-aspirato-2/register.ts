import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterPianoAspirato2() {
  useEffect(() => {
    useMachineStore.getState().setDevice('piano-aspirato-2', initialState)
  }, [])
}
