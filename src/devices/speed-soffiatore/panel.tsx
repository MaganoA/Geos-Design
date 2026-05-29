import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { SpeedSoffiatoreState } from './state'

export function Panel() {
  const s = useDeviceState<SpeedSoffiatoreState>('speed-soffiatore')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Soffiatore">
        <DataRow label="Stato" value={s.accese ? 'Acceso' : 'Spento'} />
      </DataSection>
    </div>
  )
}
