import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import type { SicurezzaElettroserratureState } from './state'

export function Panel() {
  const s = useDeviceState<SicurezzaElettroserratureState>(
    'sicurezza-elettroserrature',
  )
  if (!s) return null

  const hasErrors = s.codiceErrori.length > 0

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Elettroserrature">
        <DataRow label="Codice" value={s.codiceStato} />
        {hasErrors && (
          <DataRow label="Errori" value={s.codiceErrori.join(', ')} />
        )}
      </DataSection>
    </div>
  )
}
