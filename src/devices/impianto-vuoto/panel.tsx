import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { ImpiantoVuotoState } from './state'

export function Panel() {
  const s = useDeviceState<ImpiantoVuotoState>('impianto-vuoto')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Impianto del vuoto">
        <DataRow label="Sistema" value={s.accese ? 'Acceso' : 'Spento'} />
        <DataRow
          label="Pompa 1"
          value={s.pompa1Attiva ? 'Attiva' : 'Spento'}
        />
        <DataRow
          label="Pompa 2"
          value={s.pompa2Attiva ? 'Attiva' : 'Spento'}
        />
      </DataSection>
    </div>
  )
}
