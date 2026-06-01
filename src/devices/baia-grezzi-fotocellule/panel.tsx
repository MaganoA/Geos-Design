import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { BaiaGrezziFotocelluleState } from './state'

const STATO_LABEL: Record<BaiaGrezziFotocelluleState['stato'], string> = {
  attiva: 'Attiva',
  disattiva: 'Disattiva',
  interrotta: 'Interrotta',
}

export function Panel() {
  const s = useDeviceState<BaiaGrezziFotocelluleState>(
    'baia-grezzi-fotocellule',
  )
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Sistema sicurezza intrusione">
        <DataRow label="Stato" value={STATO_LABEL[s.stato]} />
      </DataSection>
    </div>
  )
}
