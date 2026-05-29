import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { ImpiantoAriaState } from './state'

export function Panel() {
  const s = useDeviceState<ImpiantoAriaState>('impianto-aria')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Impianto aria">
        <DataRow label="Sistema" value={s.accese ? 'Acceso' : 'Spento'} />
      </DataSection>
    </div>
  )
}
