import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { PortaleTesta2LampadeUvState } from './state'

export function Panel() {
  const s = useDeviceState<PortaleTesta2LampadeUvState>(
    'portale-testa-2-lampade-uv',
  )
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Stato dei comandi">
        <DataRow label="Lampade" value={s.accese ? 'Accese' : 'Spente'} />
        <DataRow label="Intensità" value={`${s.intensita} %`} />
        <DataRow
          label="Slitta"
          value={s.slittaPosizione === 'alta' ? 'Alta' : 'Bassa'}
        />
      </DataSection>
    </div>
  )
}
