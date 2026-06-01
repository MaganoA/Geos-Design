import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import { formatMm } from '@/lib/format'
import type { BaiaGrezziState } from './state'

export function Panel() {
  const s = useDeviceState<BaiaGrezziState>('baia-grezzi')
  if (!s) return null

  const corrente = s.lastre[0] ?? null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Stato baia">
        <DataRow
          label="Vassoio"
          value={s.vassoioPresente ? 'Presente' : 'Assente'}
        />
        <DataRow
          label="Barriere"
          value={s.barriereAttive ? 'Attive' : 'Disattive'}
        />
        <DataRow label="Lastre" value={s.lastre.length} />
      </DataSection>

      {corrente && (
        <DataSection title="Lastra caricata">
          <DataRow label="ID" value={corrente.id} />
          <DataRow
            label="Altezza"
            value={formatMm(corrente.dimensioni.altezza)}
          />
          <DataRow
            label="Larghezza"
            value={formatMm(corrente.dimensioni.larghezza)}
          />
          <DataRow
            label="Spessore"
            value={`${corrente.dimensioni.spessoreIniziale.toFixed(1)} mm`}
          />
        </DataSection>
      )}
    </div>
  )
}
