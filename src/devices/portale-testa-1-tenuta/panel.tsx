import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { Gauge } from '@/components/primitives/gauge'
import { useDeviceState } from '@/hooks/use-device-state'
import type { PortaleTesta1TenutaState } from './state'

const MODALITA_LABEL: Record<PortaleTesta1TenutaState['modalita'], string> = {
  soffio: 'Soffio',
  aspirazione: 'Aspirazione',
  niente: 'Niente',
}

// Single colour family across all modes per the HMI rule: data
// visualisations are always blue (emerald is reserved for the active
// status badge under the title). Muted stone when idle so the gauge
// still backs off visually for the niente mode.
const MODALITA_ARC: Record<PortaleTesta1TenutaState['modalita'], string> = {
  aspirazione: 'text-blue-500',
  soffio: 'text-sky-500',
  niente: 'text-stone-400',
}

export function Panel() {
  const s = useDeviceState<PortaleTesta1TenutaState>('portale-testa-1-tenuta')
  if (!s) return null

  const pct = Math.round(s.livelloDepressione * 100)

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Livello pressione">
        <div className="flex justify-center py-3">
          <Gauge
            value={pct}
            progressClassName={MODALITA_ARC[s.modalita]}
            label="Livello pressione"
            caption="pressione"
          />
        </div>
      </DataSection>

      <DataSection title="Modalità">
        <DataRow label="Corrente" value={MODALITA_LABEL[s.modalita]} />
      </DataSection>
    </div>
  )
}
