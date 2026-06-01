import { useEffect } from 'react'
import { useMachineStore } from '@/store/machine-store'
import { initialState } from './state'

export function useRegisterErogazioneResinaAlimentatoreInserti() {
  useEffect(() => {
    useMachineStore
      .getState()
      .setDevice('erogazione-resina-alimentatore-inserti', initialState)
  }, [])
}
