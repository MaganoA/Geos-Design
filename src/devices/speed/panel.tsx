import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
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
        <DataRow
          label="Angolo asse C"
          value={`${s.angoloAsseC.toFixed(1)}°`}
        />
        <DataRow
          label="Angolo ralla"
          value={`${s.angoloRalla.toFixed(1)}°`}
        />
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
