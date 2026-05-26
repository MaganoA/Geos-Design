import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { StatusBadge } from '@/components/primitives/status-badge'
import { useDeviceState } from '@/hooks/use-device-state'
import { formatMm, formatPercent, formatTime } from '@/lib/format'
import type { PortaleTesta1State } from './state'

const STATUS_LABELS: Record<string, string> = {
  active: 'Attivo',
  idle: 'Inattivo',
  warning: 'Attenzione',
  error: 'Errore',
  offline: 'Offline',
}

export function Panel() {
  const s = useDeviceState<PortaleTesta1State>('portale-testa-1')
  if (!s) return null
  return (
    <div className="flex flex-col">
      <div className="px-5 pt-4 pb-3">
        <StatusBadge status={s.status}>
          {STATUS_LABELS[s.status] ?? s.status}
        </StatusBadge>
      </div>
      <DataSection title="Coordinate">
        <DataRow label="X" value={formatMm(s.position.x)} />
        <DataRow label="Y" value={formatMm(s.position.y)} />
        <DataRow label="Z" value={formatMm(s.position.z)} />
      </DataSection>
      {s.lavorazione && (
        <DataSection title="Sistema di insertatura">
          <DataRow label="ID lavoro" value={s.lavorazione.idLavoro} />
          <DataRow label="ID lastra" value={s.lavorazione.idLastra} />
          <DataRow label="Indice foro" value={s.lavorazione.indiceForo} />
          <DataRow label="Inizio" value={formatTime(s.lavorazione.inizio)} />
        </DataSection>
      )}
      <DataSection title="Sistema di prova tenuta">
        <DataRow label="Codice stato" value={s.tenuta.codiceStato} />
        <DataRow
          label="Livello depressione"
          value={formatPercent(s.tenuta.livelloDepressione)}
        />
        <DataRow label="Modalità" value={s.tenuta.modalita} />
      </DataSection>
      <DataSection title="Erogatore (resina)">
        <DataRow label="Stato" value={s.erogatore.stato} />
      </DataSection>
    </div>
  )
}
