import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { AngleDial } from '@/components/primitives/angle-dial'
import { useDeviceState } from '@/hooks/use-device-state'
import { formatMm, formatTime } from '@/lib/format'
import type { SpeedState } from './state'

export function Panel() {
  const s = useDeviceState<SpeedState>('speed')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Macchinario">
        <DataRow label="Data/ora" value={formatTime(s.dataOra)} />
        <DataRow
          label="Velocità relazionale"
          value={`${Math.round(s.velocitaRelazionale)} mm/s`}
        />
      </DataSection>

      <DataSection title="Posizione">
        <DataRow label="X" value={formatMm(s.position.x)} />
        <DataRow label="Y" value={formatMm(s.position.y)} />
        <DataRow label="Z" value={formatMm(s.position.z)} />
      </DataSection>

      <DataSection title="Rotazione">
        <div className="flex items-center justify-around gap-2 py-2">
          <AngleDial value={s.angoloAsseC} label="Asse C" size={120} />
          <AngleDial value={s.angoloRalla} label="Ralla" size={120} />
        </div>
      </DataSection>

      <DataSection title="Utensile">
        <DataRow label="Utensile connesso" value={s.utensileConnesso} />
        <DataRow
          label="Ultimo disponibile"
          value={s.ultimoUtensileDisponibile}
        />
      </DataSection>
    </div>
  )
}
