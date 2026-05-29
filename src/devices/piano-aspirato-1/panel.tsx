import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import { useMachineStore } from '@/store/machine-store'
import { cn } from '@/lib/cn'
import {
  VENTOSE_LAYOUT,
  recomputeVentose,
  type PianoAspirato1State,
} from './state'

const MODALITA_LABEL: Record<PianoAspirato1State['modalita'], string> = {
  vuoto: 'Vuoto',
  soffio: 'Soffio',
}

export function Panel() {
  const s = useDeviceState<PianoAspirato1State>('piano-aspirato-1')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Stato del piano">
        <DataRow label="Modalità" value={MODALITA_LABEL[s.modalita]} />
        <DataRow
          label="Ventose"
          value={`${VENTOSE_LAYOUT.rows} × ${VENTOSE_LAYOUT.cols} = ${VENTOSE_LAYOUT.total}`}
        />
      </DataSection>

      <DataSection title="Disposizione ventose">
        <VentosaGrid state={s} />
      </DataSection>
    </div>
  )
}

/**
 * Interactive 5×12 grid: each cell is a `role="switch"` button. Tapping
 * toggles `abilitata` on that ventosa and recomputes the cup's `stato`
 * with the current modalità.
 *
 *  - filled emerald  → attiva (in vuoto, abilitata)
 *  - hollow stone    → disattiva and abilitata (soffio or off)
 *  - hatched/faded   → !abilitata (user has disabled the cup)
 */
function VentosaGrid({ state }: { state: PianoAspirato1State }) {
  function toggleAbilitata(index: number) {
    const store = useMachineStore.getState()
    const prev = store.devices['piano-aspirato-1'] as
      | PianoAspirato1State
      | undefined
    if (!prev) return
    const next = prev.ventose.map((v, i) =>
      i === index ? { ...v, abilitata: !v.abilitata } : v,
    )
    const ventose = recomputeVentose(next, prev.modalita)
    store.setDevice('piano-aspirato-1', { ...prev, ventose })
  }

  return (
    <div
      className="grid gap-1.5 py-2"
      style={{
        gridTemplateColumns: `repeat(${VENTOSE_LAYOUT.cols}, 1fr)`,
      }}
    >
      {state.ventose.map((v, i) => {
        const isActive = v.stato === 'attiva'
        return (
          <button
            key={i}
            type="button"
            role="switch"
            aria-checked={v.abilitata}
            aria-label={`Ventosa ${i + 1}`}
            onClick={() => toggleAbilitata(i)}
            className={cn(
              'aspect-square rounded-full border transition-all',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--text-default)]',
              v.abilitata
                ? isActive
                  ? 'border-emerald-500 bg-emerald-400/80'
                  : 'border-[var(--border-default)] bg-[var(--bg-muted)]'
                : 'border-dashed border-[var(--border-default)] bg-transparent opacity-50',
            )}
          />
        )
      })}
    </div>
  )
}
