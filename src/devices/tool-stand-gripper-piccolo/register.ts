import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterToolStandGripperPiccolo() {
  useEffect(() => {
    useMachineStore
      .getState()
      .setDevice('tool-stand-gripper-piccolo', initialState)
  }, [])
}
