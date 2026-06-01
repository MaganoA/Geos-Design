import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { BaiaLavoratiVassoioState } from './state'

export function Panel() {
  const s = useDeviceState<BaiaLavoratiVassoioState>('baia-lavorati-vassoio')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Vassoio">
        <DataRow label="ID vassoio" value={s.idVassoio} />
      </DataSection>
    </div>
  )
}
