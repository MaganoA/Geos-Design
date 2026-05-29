import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterToolStandGripperDistanziali() {
  useEffect(() => {
    useMachineStore
      .getState()
      .setDevice('tool-stand-gripper-distanziali', initialState)
  }, [])
}
