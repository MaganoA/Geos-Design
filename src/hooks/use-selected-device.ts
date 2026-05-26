import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getDevice } from '@/devices'

export function useSelectedDevice() {
  const [params, setParams] = useSearchParams()
  const id = params.get('device')

  const select = useCallback(
    (next: string | null) => {
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          if (next) p.set('device', next)
          else p.delete('device')
          return p
        },
        { replace: false },
      )
    },
    [setParams],
  )

  const device = id ? getDevice(id) : null
  return { id, device, select, clear: () => select(null) }
}
