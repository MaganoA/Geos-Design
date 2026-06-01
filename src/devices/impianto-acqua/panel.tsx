import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { ImpiantoAcquaState } from './state'

export function Panel() {
  const s = useDeviceState<ImpiantoAcquaState>('impianto-acqua')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Impianto acqua">
        <DataRow label="Sistema" value={s.accese ? 'Acceso' : 'Spento'} />
        <DataRow label="Codice acqua interna" value={s.codiceStatoInterna} />
        <DataRow label="Codice acqua esterna" value={s.codiceStatoEsterna} />
      </DataSection>
    </div>
  )
}
