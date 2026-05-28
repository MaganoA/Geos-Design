import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

/**
 * Seeds the erogatore's initial values. No ticker: the dispenser only
 * changes in response to commands (purge on/off), not on a clock.
 */
export function useRegisterPortaleTesta1Erogatore() {
  useEffect(() => {
    useMachineStore
      .getState()
      .setDevice('portale-testa-1-erogatore', initialState)
  }, [])
}
