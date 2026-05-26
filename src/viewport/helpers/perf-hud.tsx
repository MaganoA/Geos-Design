import { Stats } from '@react-three/drei'

export function PerfHud() {
  if (typeof window === 'undefined') return null
  const enabled = new URLSearchParams(window.location.search).has('perf')
  if (!enabled) return null
  return <Stats />
}
