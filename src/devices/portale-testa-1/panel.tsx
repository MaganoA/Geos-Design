import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { StatusBadge } from '@/components/primitives/status-badge'
import { useDeviceState } from '@/hooks/use-device-state'
import { formatMm, formatTime } from '@/lib/format'
import type { PortaleTesta1State } from './state'

const STATUS_LABELS: Record<PortaleTesta1State['status'], string> = {
  active: 'Attivo',
  idle: 'Inattivo',
  warning: 'Attenzione',
  error: 'Errore',
  offline: 'Offline',
}

export function Panel() {
  const s = useDeviceState<PortaleTesta1State>('portale-testa-1')
  if (!s) return null

  // Errori shown as a comma list when present, em-quad placeholder when
  // empty — tabular-nums alignment + a placeholder keeps the row from
  // appearing to "collapse" visually when there's no error to report.
  const erroriValue =
    s.codiceErrori && s.codiceErrori.length > 0
      ? s.codiceErrori.join(', ')
      : '—'

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <div className="px-1">
        <StatusBadge status={s.status}>{STATUS_LABELS[s.status]}</StatusBadge>
      </div>

      <DataSection title="Stato">
        <DataRow label="Codice stato" value={s.codiceStato ?? '—'} />
        <DataRow label="Codice errori" value={erroriValue} />
      </DataSection>

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
