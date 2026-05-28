import { useEffect } from 'react'
import { registerTicker, useMachineStore } from '@/store/machine-store'
import { applyTick, initialState, type PortaleTesta1TenutaState } from './state'

/**
 * Seeds the machine store with the prova-tenuta initial values and
 * subscribes to the shared tick loop, so the depression level tracks
 * the commanded mode. Cleanup unregisters on unmount.
 */
export function useRegisterPortaleTesta1Tenuta() {
  useEffect(() => {
    useMachineStore.getState().setDevice('portale-testa-1-tenuta', initialState)
    return registerTicker((dt) => {
      const s = useMachineStore.getState()
      const prev = s.devices['portale-testa-1-tenuta'] as
        | PortaleTesta1TenutaState
        | undefined
      if (!prev) return
      s.setDevice('portale-testa-1-tenuta', applyTick(prev, dt))
    })
  }, [])
}
