import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterErogazioneResina() {
  useEffect(() => {
    useMachineStore.getState().setDevice('erogazione-resina', initialState)
  }, [])
}
