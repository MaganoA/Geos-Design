import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterToolStand() {
  useEffect(() => {
    useMachineStore.getState().setDevice('tool-stand', initialState)
  }, [])
}
