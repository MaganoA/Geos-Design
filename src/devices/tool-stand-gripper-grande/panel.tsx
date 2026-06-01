import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import {
  type GripperStato,
  type ToolStandGripperugrandeState,
} from './state'

const STATO_LABEL: Record<GripperStato, string> = {
  'a-magazzino': 'A magazzino',
  vuoto: 'Vuoto',
  soffio: 'Soffio',
  niente: 'Niente',
}

export function Panel() {
  const s = useDeviceState<ToolStandGripperugrandeState>(
    'tool-stand-gripper-grande',
  )
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Gripper grande">
        <DataRow label="Stato" value={STATO_LABEL[s.stato]} />
        <DataRow label="Apertura dx" value={`${s.dx} mm`} />
        <DataRow label="Apertura dy" value={`${s.dy} mm`} />
      </DataSection>
    </div>
  )
}
