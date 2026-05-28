import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { PortaleTesta1ErogatoreState } from './state'

export function Panel() {
  const s = useDeviceState<PortaleTesta1ErogatoreState>(
    'portale-testa-1-erogatore',
  )
  if (!s) return null

  // Valve state (aperto/chiuso) lives in the header badge; here we
  // surface the two independent command states the operator commands
  // — purge cycle and compressed-air supply — so the badge's generic
  // Attivo/Attenzione is grounded in what's actually engaged.
  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Stato dei comandi">
        <DataRow
          label="Spurgo"
          value={s.spurgoAttivo ? 'Attivo' : 'Disattivo'}
        />
        <DataRow
          label="Aria compressa"
          value={s.ariaCompressaAttiva ? 'Attiva' : 'Disattiva'}
        />
      </DataSection>
    </div>
  )
}
