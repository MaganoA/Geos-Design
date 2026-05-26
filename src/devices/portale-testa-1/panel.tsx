import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import { formatMm, formatTime } from '@/lib/format'
import type { PortaleTesta1State } from './state'

export function Panel() {
  const s = useDeviceState<PortaleTesta1State>('portale-testa-1')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Posizione">
        <DataRow label="X" value={formatMm(s.position.x)} />
        <DataRow label="Y" value={formatMm(s.position.y)} />
        <DataRow label="Z" value={formatMm(s.position.z)} />
      </DataSection>

      {s.lavorazione && (
        <DataSection title="Lavorazione in corso">
          <DataRow label="ID lavoro" value={s.lavorazione.idLavoro} />
          <DataRow label="ID lavorazione" value={s.lavorazione.idLavorazione} />
          <DataRow label="ID lastra" value={s.lavorazione.idLastra} />
          <DataRow label="Indice foro" value={s.lavorazione.indiceForo} />
          <DataRow label="Inizio" value={formatTime(s.lavorazione.inizio)} />
          <DataRow
            label="Fine precedente"
            value={formatTime(s.lavorazione.finePrec)}
          />
        </DataSection>
      )}
    </div>
  )
}
