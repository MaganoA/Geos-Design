import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterPianoAspirato1() {
  useEffect(() => {
    useMachineStore.getState().setDevice('piano-aspirato-1', initialState)
  }, [])
}
