import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import {
  FLEXPIN_LABEL,
  type ErogazioneResinaAlimentatoreInsertiState,
} from './state'

export function Panel() {
  const s = useDeviceState<ErogazioneResinaAlimentatoreInsertiState>(
    'erogazione-resina-alimentatore-inserti',
  )
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Alimentatore inserti">
        <DataRow label="Stato" value={s.acceso ? 'Acceso' : 'Spento'} />
        <DataRow label="Codice stato" value={s.codiceStato} />
        <DataRow
          label="Flexpin"
          value={`${s.idFlexpin} — ${FLEXPIN_LABEL[s.idFlexpin]}`}
        />
      </DataSection>
    </div>
  )
}
