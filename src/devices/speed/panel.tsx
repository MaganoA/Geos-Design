import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { RangeBarRow } from '@/components/patterns/range-bar-row'
import { AngleDial } from '@/components/primitives/angle-dial'
import { useDeviceState } from '@/hooks/use-device-state'
import PlugsIcon from '@/icons/plugs.svg?react'
import { formatMm } from '@/lib/format'
import type { SpeedState } from './state'

// Nominal machine range for velocità relazionale. The state oscillates
// around 250 ± 35 mm/s, so 0–500 puts the bar at mid-scale during
// normal operation and leaves clear headroom for deviations.
const VELOCITA_MIN = 0
const VELOCITA_MAX = 500

export function Panel() {
  const s = useDeviceState<SpeedState>('speed')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      {/* Primary metric of the panel: promoted to its own card so it
       * sits at the same hierarchical level as Posizione / Rotazione /
       * Utensile, rather than buried under a generic "Macchinario"
       * grouping. Section title carries the identifier; the
       * RangeBarRow drops its internal label to avoid duplication.
       * The body holds operational data only. */}
      <DataSection title="Velocità relazionale">
        <RangeBarRow
          ariaLabel="Velocità relazionale"
          value={s.velocitaRelazionale}
          unit="mm/s"
          min={VELOCITA_MIN}
          max={VELOCITA_MAX}
        />
      </DataSection>

      <DataSection title="Posizione">
        <DataRow label="X" value={formatMm(s.position.x)} />
        <DataRow label="Y" value={formatMm(s.position.y)} />
        <DataRow label="Z" value={formatMm(s.position.z)} />
      </DataSection>

      <DataSection title="Rotazione">
        <div className="flex items-center justify-around gap-2 py-2">
          <AngleDial value={s.angoloAsseC} label="Asse C" size={120} />
          <AngleDial value={s.angoloRalla} label="Ralla" size={120} />
        </div>
      </DataSection>

      <DataSection title="Utensile">
        <DataRow
          label="Utensile connesso"
          value={<ToolBadge value={s.utensileConnesso} />}
        />
        <DataRow
          label="Ultimo disponibile"
          value={<ToolBadge value={s.ultimoUtensileDisponibile} />}
        />
      </DataSection>
    </div>
  )
}

function ToolBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-[var(--bg-muted)] px-2 py-0.5 text-xs font-normal tracking-wide text-[var(--text-subtle)]">
      <PlugsIcon className="h-3 w-3 shrink-0 text-[var(--icon-default-disabled)]" />
      {value}
    </span>
  )
}
