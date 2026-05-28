import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { PortaleTesta2GripperPinState } from './state'

const STATO_LABEL: Record<PortaleTesta2GripperPinState['stato'], string> = {
  aperto: 'Aperto',
  chiuso: 'Chiuso',
}

export function Panel() {
  const s = useDeviceState<PortaleTesta2GripperPinState>(
    'portale-testa-2-gripper-pin',
  )
  if (!s) return null

  const showDestinazione = s.angoloDestinazione !== s.angolo

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Stato del gripper">
        {/*
          The badge shows the aggregate (Attivo / Inattivo / Attenzione)
          but doesn't say which mechanical state caused it — this row
          disambiguates between "open jaws" and "rotating" at a glance.
        */}
        <DataRow label="Ganasce" value={STATO_LABEL[s.stato]} />
        <DataRow label="Angolo" value={`${s.angolo.toFixed(1)}°`} />
        {showDestinazione && (
          <DataRow label="Destinazione" value={`${s.angoloDestinazione}°`} />
        )}
      </DataSection>
    </div>
  )
}
