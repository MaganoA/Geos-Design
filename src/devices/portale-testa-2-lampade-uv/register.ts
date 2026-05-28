import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterPortaleTesta2LampadeUv() {
  useEffect(() => {
    useMachineStore
      .getState()
      .setDevice('portale-testa-2-lampade-uv', initialState)
  }, [])
}
