import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { GripperKind, ToolStandState } from './state'

const GRIPPER_LABEL: Record<GripperKind, string> = {
  piccolo: 'Piccolo',
  medio: 'Medio',
  grande: 'Grande',
  distanziali: 'Distanziali',
}

export function Panel() {
  const s = useDeviceState<ToolStandState>('tool-stand')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Tool stand">
        <DataRow
          label="Gripper montato"
          value={s.gripperMontato ? GRIPPER_LABEL[s.gripperMontato] : '—'}
        />
      </DataSection>
    </div>
  )
}
