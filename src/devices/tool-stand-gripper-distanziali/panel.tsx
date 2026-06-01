import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { ToolStandGripperDistanzialiState } from './state'

export function Panel() {
  const s = useDeviceState<ToolStandGripperDistanzialiState>(
    'tool-stand-gripper-distanziali',
  )
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Gripper dei distanziali">
        <DataRow label="Apertura dx" value={`${s.dx} mm`} />
        <DataRow label="Apertura dy" value={`${s.dy} mm`} />
      </DataSection>
    </div>
  )
}
