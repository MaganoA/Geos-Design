import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterSicurezzaElettroserrature() {
  useEffect(() => {
    useMachineStore
      .getState()
      .setDevice('sicurezza-elettroserrature', initialState)
  }, [])
}
