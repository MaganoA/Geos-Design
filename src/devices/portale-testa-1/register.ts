import { useEffect } from 'react'
import { registerTicker, useMachineStore } from '@/store/machine-store'
import { applyTick, initialState, type PortaleTesta1State } from './state'

/**
 * Seeds the machine store with Portale Testa 1's initial values and
 * subscribes to the shared tick loop. Returns nothing — the cleanup
 * unregisters automatically on unmount.
 */
export function useRegisterPortaleTesta1() {
  useEffect(() => {
    useMachineStore.getState().setDevice('portale-testa-1', initialState)
    return registerTicker((dt) => {
      const s = useMachineStore.getState()
      const prev = s.devices['portale-testa-1'] as PortaleTesta1State | undefined
      if (!prev) return
      s.setDevice('portale-testa-1', applyTick(prev, dt))
    })
  }, [])
}
