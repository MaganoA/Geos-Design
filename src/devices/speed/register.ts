import { useEffect } from 'react'
import { registerTicker, useMachineStore } from '@/store/machine-store'
import { applyTick, initialState, type SpeedState } from './state'

export function useRegisterSpeed() {
  useEffect(() => {
    useMachineStore.getState().setDevice('speed', initialState)
    return registerTicker((dt) => {
      const s = useMachineStore.getState()
      const prev = s.devices['speed'] as SpeedState | undefined
      if (!prev) return
      s.setDevice('speed', applyTick(prev, dt))
    })
  }, [])
}
