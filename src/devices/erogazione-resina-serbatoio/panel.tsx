import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import { formatPercent } from '@/lib/format'
import type { ErogazioneResinaSerbatoioState } from './state'

export function Panel() {
  const s = useDeviceState<ErogazioneResinaSerbatoioState>(
    'erogazione-resina-serbatoio',
  )
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Serbatoio">
        <DataRow label="Pressione" value={s.pressioneOk ? 'OK' : 'Bassa'} />
        <DataRow
          label="Pressurizzazione"
          value={s.pressurizzazione ? 'Attiva' : 'Disattiva'}
        />
      </DataSection>

      <DataSection title="Livello resina">
        <DataRow label="Livello" value={formatPercent(s.livello)} />
        <DataRow
          label="Limite minimo"
          value={formatPercent(s.limiteMinimo)}
        />
      </DataSection>
    </div>
  )
}
