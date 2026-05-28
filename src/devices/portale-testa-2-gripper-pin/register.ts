import { useEffect } from 'react'
import { registerTicker, useMachineStore } from '@/store/machine-store'
import {
  applyTick,
  initialState,
  type PortaleTesta2GripperPinState,
} from './state'

export function useRegisterPortaleTesta2GripperPin() {
  useEffect(() => {
    useMachineStore
      .getState()
      .setDevice('portale-testa-2-gripper-pin', initialState)
    return registerTicker((dt) => {
      const s = useMachineStore.getState()
      const prev = s.devices['portale-testa-2-gripper-pin'] as
        | PortaleTesta2GripperPinState
        | undefined
      if (!prev) return
      s.setDevice('portale-testa-2-gripper-pin', applyTick(prev, dt))
    })
  }, [])
}
