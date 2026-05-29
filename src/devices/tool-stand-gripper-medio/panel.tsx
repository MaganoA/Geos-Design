import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import { useMachineStore } from '@/store/machine-store'
import { cn } from '@/lib/cn'
import {
  VALVE_COUNT,
  type GripperStato,
  type ToolStandGripperumedioState,
} from './state'

const STATO_LABEL: Record<GripperStato, string> = {
  'a-magazzino': 'A magazzino',
  vuoto: 'Vuoto',
  soffio: 'Soffio',
  niente: 'Niente',
}

export function Panel() {
  const s = useDeviceState<ToolStandGripperumedioState>(
    'tool-stand-gripper-medio',
  )
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Gripper medio">
        <DataRow label="Stato" value={STATO_LABEL[s.stato]} />
        <DataRow label="Apertura dx" value={`${s.dx} mm`} />
        <DataRow label="Apertura dy" value={`${s.dy} mm`} />
      </DataSection>

      <DataSection title="Valvole">
        <ValveGrid ventose={s.ventose} />
      </DataSection>
    </div>
  )
}

/**
 * Per-valve switches: tap toggles `attiva`. Only the modality (driven
 * by the robot head's vacuum subsystem) decides whether attiva actually
 * draws a vacuum — this grid surfaces the operator's intent.
 */
function ValveGrid({
  ventose,
}: {
  ventose: ToolStandGripperumedioState['ventose']
}) {
  function toggleValvola(index: number) {
    const store = useMachineStore.getState()
    const prev = store.devices['tool-stand-gripper-medio'] as
      | ToolStandGripperumedioState
      | undefined
    if (!prev) return
    const next = prev.ventose.map((v, i) =>
      i === index ? { ...v, attiva: !v.attiva } : v,
    )
    store.setDevice('tool-stand-gripper-medio', { ...prev, ventose: next })
  }

  return (
    <div
      className="grid gap-1.5 py-2"
      style={{ gridTemplateColumns: `repeat(${VALVE_COUNT}, 1fr)` }}
    >
      {ventose.map((v, i) => (
        <button
          key={i}
          type="button"
          role="switch"
          aria-checked={v.attiva}
          aria-label={`Valvola ${i + 1}`}
          onClick={() => toggleValvola(i)}
          className={cn(
            'aspect-square rounded-full border transition-all',
            'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--text-default)]',
            v.attiva
              ? 'border-emerald-500 bg-emerald-400/80'
              : 'border-[var(--border-default)] bg-[var(--bg-muted)]',
          )}
        />
      ))}
    </div>
  )
}
