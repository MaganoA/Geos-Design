import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { AngleDial } from '@/components/primitives/angle-dial'
import { useDeviceState } from '@/hooks/use-device-state'
import type { RobotState } from './state'
import { GripperSection } from './gripper-section'

export function Panel() {
  const robot = useDeviceState<RobotState>('robot')
  if (!robot) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Posizione">
        {/* Six joint dials in a 3-col grid — compact enough to fit two
         * rows in the right panel and still glanceable. Distanza stays
         * as a text row below: it's a linear axis, not rotational. */}
        <div className="grid grid-cols-3 justify-items-center gap-y-3 py-2">
          {robot.angoli.map((deg, i) => (
            <AngleDial
              key={`J${i + 1}`}
              value={deg}
              label={`J${i + 1}`}
              size={84}
            />
          ))}
        </div>
        <DataRow label="Distanza" value={`${robot.distanza} mm`} />
      </DataSection>

      {/* The Gripper readout used to live as a DataRow here, mirroring
       * tool-stand.gripperMontato. It's now its own slot: a primary
       * CTA when no gripper is mounted, or a link card to the mounted
       * gripper's panel when one is — collapsing the indirection so
       * the operator goes from "I need a gripper" to "I'm on it" in
       * one tap. */}
      <GripperSection />
    </div>
  )
}
