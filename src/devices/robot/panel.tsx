import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { RobotState } from './state'
import type { GripperKind, ToolStandState } from '../tool-stand/state'

// Localised, capitalised labels for the four gripper presets. Kept
// alongside the robot panel (rather than reaching into tool-stand) so
// the mounted-gripper readout reads the same way regardless of which
// device the operator opened.
const GRIPPER_LABEL: Record<GripperKind, string> = {
  piccolo: 'Piccolo',
  medio: 'Medio',
  grande: 'Grande',
  distanziali: 'Distanziali',
}

export function Panel() {
  const robot = useDeviceState<RobotState>('robot')
  // Cross-device read: the robot doesn't own the gripper choice — the
  // tool-stand does — but for the operator this readout is most useful
  // here, next to the pose.
  const toolStand = useDeviceState<ToolStandState>('tool-stand')
  if (!robot) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Posizione">
        {robot.angoli.map((deg, i) => (
          <DataRow
            key={`J${i + 1}`}
            label={`J${i + 1}`}
            value={`${deg}°`}
          />
        ))}
        <DataRow label="Distanza" value={`${robot.distanza} mm`} />
      </DataSection>

      <DataSection title="Gripper">
        <DataRow
          label="Gripper montato"
          value={
            toolStand?.gripperMontato
              ? GRIPPER_LABEL[toolStand.gripperMontato]
              : '—'
          }
        />
      </DataSection>
    </div>
  )
}
