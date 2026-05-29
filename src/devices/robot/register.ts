import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterRobot() {
  useEffect(() => {
    useMachineStore.getState().setDevice('robot', initialState)
  }, [])
}
