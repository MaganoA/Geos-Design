import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { ErogazioneResinaErogatoreState } from './state'

export function Panel() {
  const s = useDeviceState<ErogazioneResinaErogatoreState>(
    'erogazione-resina-erogatore',
  )
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Erogatore">
        <DataRow
          label="Stato"
          value={s.stato === 'aperto' ? 'Aperto' : 'Chiuso'}
        />
        <DataRow
          label="Aria compressa"
          value={s.ariaCompressa ? 'On' : 'Off'}
        />
      </DataSection>
    </div>
  )
}
