import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { DispenserDistanzialiState } from './state'

export function Panel() {
  const s = useDeviceState<DispenserDistanzialiState>('dispenser-distanziali')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Dispenser">
        <DataRow label="ID distanziale" value={s.idDistanziale} />
      </DataSection>
    </div>
  )
}
