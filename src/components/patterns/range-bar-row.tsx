import { Text } from '@/components/primitives/text'
import { cn } from '@/lib/cn'

interface RangeBarRowProps {
  /** Left-hand label (mirrors DataRow). Optional — omit when the row
   * lives inside a DataSection whose title already labels it, to avoid
   * a duplicated identifier. The bar's aria-label still falls back to
   * the label when present; without it, callers should provide
   * `ariaLabel` so assistive tech still has a name for the progressbar. */
  label?: string
  /** Accessibility name used when `label` is omitted. */
  ariaLabel?: string
  /** Current sample. */
  value: number
  /** Unit suffix appended to the right of the numeral (e.g. "mm/s"). */
  unit?: string
  /** Lower bound of the bar's scale. */
  min: number
  /** Upper bound of the bar's scale. */
  max: number
  /** Formatter for the displayed numeral. Default rounds to integer. */
  format?: (v: number) => string
  className?: string
}

const clampPct = (v: number, min: number, max: number) => {
  if (max === min) return 0
  return Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100))
}

/**
 * Velocity / setpoint row for a Speed-style DataSection: compact label
 * + big numeral on one line, a thin horizontal progress bar below
 * showing where the value sits between min and max.
 *
 * The bar uses --accent (#437DFC) for the fill against a muted track,
 * so the eye finds the "current position" instantly against the
 * monochrome chrome around it. The bar carries role="progressbar"
 * with aria-valuemin/max/now so assistive tech reads the geometric
 * truth, not just the numeral.
 *
 * Status pill intentionally omitted — at the section level the device
 * status badge in the panel header already carries that signal and
 * repeating it inside would be noise.
 */
export function RangeBarRow({
  label,
  ariaLabel,
  value,
  unit,
  min,
  max,
  format = (v) => Math.round(v).toString(),
  className,
}: RangeBarRowProps) {
  const clampedValue = Math.max(min, Math.min(max, value))
  const pct = clampPct(value, min, max)

  return (
    <div className={cn('flex flex-col gap-2 py-2', className)}>
      {label ? (
        <Text variant="sm/normal" className="text-[var(--text-muted)]">
          {label}
        </Text>
      ) : null}
      <div className="flex items-baseline gap-1.5">
        <span className="text-[26px] font-medium leading-none tabular-nums tracking-tight text-[var(--text-default)]">
          {format(value)}
        </span>
        {unit ? (
          <span className="text-[13px] font-normal text-[var(--text-muted)]">
            {unit}
          </span>
        ) : null}
      </div>
      <div
        role="progressbar"
        aria-label={label ?? ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(clampedValue)}
        className="relative h-1 w-full overflow-hidden rounded-full bg-[var(--border-mute)]"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)] transition-[width] duration-200 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
