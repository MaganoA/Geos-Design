import { useEffect } from 'react'
import { registerTicker, useMachineStore } from '@/store/machine-store'
import { applyTick, initialState, type PortaleTesta2State } from './state'

export function useRegisterPortaleTesta2() {
  useEffect(() => {
    useMachineStore.getState().setDevice('portale-testa-2', initialState)
    return registerTicker((dt) => {
      const s = useMachineStore.getState()
      const prev = s.devices['portale-testa-2'] as PortaleTesta2State | undefined
      if (!prev) return
      s.setDevice('portale-testa-2', applyTick(prev, dt))
    })
  }, [])
}
