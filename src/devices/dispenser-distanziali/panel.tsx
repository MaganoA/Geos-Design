import { DataRow } from '@/components/patterns/data-row'
import { DataSection } from '@/components/patterns/data-section'
import { useDeviceState } from '@/hooks/use-device-state'
import { Text } from '@/components/primitives/text'
import { cn } from '@/lib/cn'
import { PISTONI_COUNT, type DispenserDistanzialiState } from './state'

export function Panel() {
  const s = useDeviceState<DispenserDistanzialiState>('dispenser-distanziali')
  if (!s) return null

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
      <DataSection title="Dispenser">
        <DataRow label="Codice stato" value={s.codiceStato} />
        <DataRow label="ID distanziale" value={s.idDistanziale} />
      </DataSection>

      <DataSection title={`Pistoni (${PISTONI_COUNT})`}>
        <div className="grid grid-cols-3 gap-1.5 py-2">
          {s.pistoni.map((p, i) => {
            const avanti = p.stato === 'avanti'
            return (
              <div
                key={i}
                className={cn(
                  'flex items-center justify-between rounded border px-2 py-1.5',
                  avanti
                    ? 'border-emerald-500/40 bg-emerald-400/10'
                    : 'border-[var(--border-mute)] bg-transparent',
                )}
              >
                <Text variant="sm/normal" className="text-[var(--text-muted)]">
                  P{i + 1}
                </Text>
                <Text
                  variant="sm/medium"
                  className="text-[var(--text-default)] tabular-nums"
                >
                  {avanti ? '→' : '←'}
                </Text>
              </div>
            )
          })}
        </div>
      </DataSection>
    </div>
  )
}
