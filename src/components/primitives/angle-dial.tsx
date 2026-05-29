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
        {/* Needle: tip and tail positions computed in viewport space.
         * Avoids the SVG/CSS transform-origin trap — CSS transform-origin
         * on a <g> resolves against the group's bounding box, not the
         * viewport, which would silently rotate the needle around the
         * wrong pivot. Direct trig keeps the geometry honest. */}
        {(() => {
          // SVG y grows downward; subtract 90° so 0° points to twelve.
          const a = ((wrapped - 90) * Math.PI) / 180
          const tipR = radius - tickLen - strokeWidth
          const tailR = radius * 0.18
          const tipX = cx + Math.cos(a) * tipR
          const tipY = cy + Math.sin(a) * tipR
          const tailX = cx - Math.cos(a) * tailR
          const tailY = cy - Math.sin(a) * tailR
          return (
            <g className={needleClassName}>
              <line
                x1={tailX}
                y1={tailY}
                x2={tipX}
                y2={tipY}
                stroke="currentColor"
                strokeWidth={strokeWidth * 1.1}
                strokeLinecap="round"
              />
              <circle
                cx={cx}
                cy={cy}
                r={strokeWidth * 0.7}
                fill="currentColor"
              />
            </g>
          )
        })()}
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
