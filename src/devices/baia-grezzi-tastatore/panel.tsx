import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { BaiaGrezziTastatoreState } from './state'

function mm(n: number): string {
  return `${n.toFixed(1)} mm`
}

export function Panel() {
  const s = useDeviceState<BaiaGrezziTastatoreState>('baia-grezzi-tastatore')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Allineatore lungo">
        <DataRow label="Laser 1" value={mm(s.laser.lungo1)} />
        <DataRow label="Laser 2" value={mm(s.laser.lungo2)} />
      </DataSection>

      <DataSection title="Allineatori laterali">
        <DataRow label="Sinistra" value={mm(s.laser.sinistra)} />
        <DataRow label="Destra" value={mm(s.laser.destra)} />
      </DataSection>
    </div>
  )
}
