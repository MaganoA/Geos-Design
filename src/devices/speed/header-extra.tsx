import { TimeBadge } from '@/components/patterns/time-badge'
import { useDeviceState } from '@/hooks/use-device-state'
import { formatTime } from '@/lib/format'
import type { SpeedState } from './state'

/**
 * Lives in the RightPanel header next to the status badge — Andrea's
 * call: "il badge andrebbe di fianco ad Attivo". Both are session-level
 * signals (am I connected, what time is it?) so they belong together
 * in the panel chrome instead of taking a row inside the data body.
 */
export function HeaderExtra() {
  const s = useDeviceState<SpeedState>('speed')
  if (!s) return null
  return <TimeBadge time={formatTime(s.dataOra)} />
}
