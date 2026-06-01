import { useEffect } from 'react'
import { useMachineStore, registerTicker } from '@/store/machine-store'
import { applyTick, initialState, type BaiaGrezziTastatoreState } from './state'

const DEVICE_ID = 'baia-grezzi-tastatore'

export function useRegisterBaiaGrezziTastatore() {
  useEffect(() => {
    useMachineStore.getState().setDevice(DEVICE_ID, initialState)
    return registerTicker(() => {
      const s = useMachineStore.getState()
      const prev = s.devices[DEVICE_ID] as BaiaGrezziTastatoreState | undefined
      if (!prev) return
      s.setDevice(DEVICE_ID, applyTick(prev))
    })
  }, [])
}
