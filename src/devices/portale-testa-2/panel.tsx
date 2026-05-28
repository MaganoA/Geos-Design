import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { StatusBadge } from '@/components/primitives/status-badge'
import { getDevice } from '@/devices'
import { useDeviceState } from '@/hooks/use-device-state'
import { useSelectedDevice } from '@/hooks/use-selected-device'
import { formatMm, formatTime } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { DeviceStatus } from '@/types/device'
import type { PortaleTesta2State } from './state'

const STATUS_LABELS: Record<DeviceStatus, string> = {
  active: 'Attivo',
  idle: 'Inattivo',
  warning: 'Attenzione',
  error: 'Errore',
  offline: 'Offline',
}

const CHILD_IDS = [
  'portale-testa-2-gripper-pin',
  'portale-testa-2-lampade-uv',
] as const

export function Panel() {
  const s = useDeviceState<PortaleTesta2State>('portale-testa-2')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Sotto-dispositivi">
        {CHILD_IDS.map((id) => (
          <ChildLink key={id} id={id} />
        ))}
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

/**
 * A row for a child device in the parent panel: shows the registry
 * label + a live status badge, and navigates on tap. Helper kept local
 * to Testa 2 — promote to /patterns when a third parent needs it.
 */
function ChildLink({ id }: { id: string }) {
  const child = useDeviceState<{ status?: DeviceStatus }>(id)
  const label = getDevice(id).meta.label
  const status: DeviceStatus = child?.status ?? 'offline'
  const { select } = useSelectedDevice()

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => select(id)}
      className={cn(
        'flex w-full items-center justify-between py-2 text-left',
        'rounded-[var(--radius-sm)] hover:bg-[var(--bg-muted)] active:scale-[0.995]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-default)]',
      )}
    >
      <span className="text-[14px] font-normal text-[var(--text-default)]">
        {label}
      </span>
      <span className="flex items-center gap-2">
        <StatusBadge status={status}>{STATUS_LABELS[status]}</StatusBadge>
        <span aria-hidden className="text-[14px] text-[var(--text-muted)]">
          →
        </span>
      </span>
    </button>
  )
}
