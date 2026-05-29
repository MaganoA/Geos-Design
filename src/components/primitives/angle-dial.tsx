import { cn } from '@/lib/cn'

interface AngleDialProps {
  /**
   * Angle in degrees. Any real number is accepted: negative values and
   * values past ±360° are wrapped for the needle but the original
   * signed value is shown in the readout (operator wants to see "-90°"
   * not "270°" for a joint that's swung past zero).
   */
  value: number
  /** Outer diameter in CSS pixels. */
  size?: number
  /** Stroke width of the circular track. */
  strokeWidth?: number
  /** Tailwind text-color class for the needle. */
  needleClassName?: string
  /** Tailwind text-color class for the track ring. */
  trackClassName?: string
  /** Accessible name + visible caption under the centre value. */
  label?: string
  className?: string
}

const wrap360 = (n: number) => ((n % 360) + 360) % 360

/**
 * Compass-style angle dial: a static circular track with four cardinal
 * tick marks (0/90/180/270, 0° at twelve o'clock) and a needle rotating
 * to the current angle.
 *
 * The needle uses a CSS `transform` rotation so smooth motion from a
 * ticking value lands "for free" without a motion library. Signed
 * angles render verbatim in the centre readout — only the needle wraps
 * to 0–360 so an axis at -90° points to nine o'clock the way a real
 * dial would.
 */
export function AngleDial({
  value,
  size = 100,
  strokeWidth = 4,
  needleClassName = 'text-[var(--text-default)]',
  trackClassName = 'text-[var(--border-mute)]',
  label,
  className,
}: AngleDialProps) {
  const wrapped = wrap360(value)
  const radius = size / 2 - strokeWidth
  const cx = size / 2
  const cy = size / 2

  // Tick marks at the four cardinals — small radial lines just inside
  // the ring. Length scales with the dial so they read on both the
  // compact (100 px) and large (160 px) variants.
  const tickLen = Math.max(4, Math.round(size * 0.06))
  const cardinals = [0, 90, 180, 270]

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(wrapped)}
      aria-label={label}
      className={cn('relative inline-block', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        {/* Outer track. */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={trackClassName}
        />
        {/* Cardinal tick marks (N/E/S/W). */}
        {cardinals.map((deg) => {
          const a = ((deg - 90) * Math.PI) / 180
          const x1 = cx + Math.cos(a) * radius
          const y1 = cy + Math.sin(a) * radius
          const x2 = cx + Math.cos(a) * (radius - tickLen)
          const y2 = cy + Math.sin(a) * (radius - tickLen)
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={strokeWidth / 1.5}
              strokeLinecap="round"
              className={trackClassName}
            />
          )
        })}
        {/* Needle group, rotated to the current (wrapped) angle. */}
        <g
          transform={`rotate(${wrapped} ${cx} ${cy})`}
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'transform 300ms ease-out',
          }}
          className={needleClassName}
        >
          {/* Tail (short stub behind the pivot). */}
          <line
            x1={cx}
            y1={cy + radius * 0.18}
            x2={cx}
            y2={cy}
            stroke="currentColor"
            strokeWidth={strokeWidth * 0.9}
            strokeLinecap="round"
          />
          {/* Main needle — points "up" at angle 0, then group-rotated. */}
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - radius * 0.82}
            stroke="currentColor"
            strokeWidth={strokeWidth * 1.1}
            strokeLinecap="round"
          />
          {/* Hub. */}
          <circle cx={cx} cy={cy} r={strokeWidth * 0.7} fill="currentColor" />
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span
          className="font-medium tabular-nums text-[var(--text-default)]"
          style={{ fontSize: Math.max(11, Math.round(size / 6.5)) }}
        >
          {value.toFixed(1)}°
        </span>
        {label ? (
          <span
            className="mt-1 text-[var(--text-muted)]"
            style={{ fontSize: Math.max(10, Math.round(size / 10)) }}
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  )
}
