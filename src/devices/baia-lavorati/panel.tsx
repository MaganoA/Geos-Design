import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import { formatMm } from '@/lib/format'
import type { BaiaLavoratiState } from './state'

export function Panel() {
  const s = useDeviceState<BaiaLavoratiState>('baia-lavorati')
  if (!s) return null

  const ultima = s.lastre[s.lastre.length - 1] ?? null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Stato baia">
        <DataRow label="Lastre" value={s.lastre.length} />
      </DataSection>

      {ultima && (
        <DataSection title="Lastra caricata">
          <DataRow label="ID" value={ultima.id} />
          <DataRow
            label="Altezza"
            value={formatMm(ultima.dimensioni.altezza)}
          />
          <DataRow
            label="Larghezza"
            value={formatMm(ultima.dimensioni.larghezza)}
          />
          <DataRow
            label="Spessore"
            value={`${ultima.dimensioni.spessoreIniziale.toFixed(1)} mm`}
          />
        </DataSection>
      )}
    </div>
  )
}
