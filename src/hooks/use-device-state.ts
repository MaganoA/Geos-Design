import { useMachineStore } from '@/store/machine-store'

export function useDeviceState<T>(id: string): T | undefined {
  return useMachineStore((s) => s.devices[id] as T | undefined)
}
