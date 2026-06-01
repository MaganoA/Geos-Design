import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { ErogazioneResinaState } from './state'

export function Panel() {
  const s = useDeviceState<ErogazioneResinaState>('erogazione-resina')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Sistema di erogazione">
        <DataRow
          label="Pressione"
          value={s.pressioneOk ? 'OK' : 'Bassa'}
        />
        <DataRow label="ID resina" value={s.idResina} />
      </DataSection>
    </div>
  )
}
