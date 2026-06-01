import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import { useMachineStore } from '@/store/machine-store'
import { cn } from '@/lib/cn'
import {
  VENTOSE_LAYOUT,
  recomputeVentose,
  type PianoAspirato2State,
} from './state'

const MODALITA_LABEL: Record<PianoAspirato2State['modalita'], string> = {
  vuoto: 'Vuoto',
  soffio: 'Soffio',
}

export function Panel() {
  const s = useDeviceState<PianoAspirato2State>('piano-aspirato-2')
  if (!s) return null

  const bypassCount = s.lastreBypass.length

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Stato del piano">
        <DataRow label="Modalità" value={MODALITA_LABEL[s.modalita]} />
        <DataRow
          label="Ventose"
          value={`${VENTOSE_LAYOUT.rows} × ${VENTOSE_LAYOUT.cols} = ${VENTOSE_LAYOUT.total}`}
        />
        {bypassCount > 0 && (
          <DataRow label="Lastre in by-pass" value={String(bypassCount)} />
        )}
      </DataSection>

      <DataSection title="Disposizione ventose">
        <VentosaGrid state={s} />
      </DataSection>
    </div>
  )
}

function VentosaGrid({ state }: { state: PianoAspirato2State }) {
  function toggleAbilitata(index: number) {
    const store = useMachineStore.getState()
    const prev = store.devices['piano-aspirato-2'] as
      | PianoAspirato2State
      | undefined
    if (!prev) return
    const next = prev.ventose.map((v, i) =>
      i === index ? { ...v, abilitata: !v.abilitata } : v,
    )
    const ventose = recomputeVentose(next, prev.modalita)
    store.setDevice('piano-aspirato-2', { ...prev, ventose })
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
