import { cn } from '@/lib/cn'

interface AngleDialProps {
  /**
   * Angle in degrees. The progress arc grows from 0° (twelve o'clock)
   * clockwise to this value, wrapping at 360°. Negative values wrap
   * too so the arc stays well-defined; the centre readout preserves
   * the original sign because the operator wants "-90°" not "270°".
   */
  value: number
  /** Outer diameter in CSS pixels. */
  size?: number
  /**
   * Stroke width of the track + progress arc. Default scales with the
   * dial size so the proportions read the same at 80 px and 200 px.
   */
  strokeWidth?: number
  /** Tailwind text-color class for the progress arc + tip marker. */
  progressClassName?: string
  /** Tailwind text-color class for the track ring + cardinal ticks. */
  trackClassName?: string
  /** Accessible name + visible caption under the centre value. */
  label?: string
  className?: string
}

const wrap360 = (n: number) => ((n % 360) + 360) % 360

/**
 * Progress-arc angle dial. A thick grey ring (track) carries a thick
 * black arc that sweeps from 0° at twelve o'clock clockwise to the
 * current angle. A small inward-pointing triangle marks the arc tip;
 * four small ticks at the cardinals (0/90/180/270) anchor the eye.
 *
 * Pure SVG paths in viewport coordinates — no CSS/SVG transform
 * shenanigans. The arc and tip are recomputed on each render so a live
 * ticking value (asse C, ralla) reads cleanly without needing a
 * transition that would lag behind the data.
 */
export function AngleDial({
  value,
  size = 120,
  strokeWidth,
  progressClassName = 'text-[var(--text-default)]',
  trackClassName = 'text-[var(--border-mute)]',
  label,
  className,
}: AngleDialProps) {
  const stroke = strokeWidth ?? Math.max(3, Math.round(size * 0.065))
  const wrapped = wrap360(value)
  const cx = size / 2
  const cy = size / 2
  // Pull the ring in so rounded caps don't get clipped at the edges.
  const r = size / 2 - stroke / 2 - 1

  // Arc geometry — start at 12 o'clock, sweep clockwise. SVG's elliptical
  // arc takes a "large-arc-flag" that decides which of the two possible
  // arcs to draw; for any sweep past 180° we want the long way around.
  const θ = (wrapped * Math.PI) / 180
  const startX = cx
  const startY = cy - r
  const endX = cx + r * Math.sin(θ)
  const endY = cy - r * Math.cos(θ)
  const largeArc = wrapped > 180 ? 1 : 0
  const arcPath = `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`

  // Render the arc only past a small epsilon — at exactly 0° the path
  // would collapse to a zero-length segment, and Safari turns that into
  // a stray dot with rounded caps. A few hundredths of a degree of
  // tolerance keeps the dial silent at rest.
  const showArc = wrapped > 0.05

  // Cardinal tick marks just inside the ring. Drawn under the arc so the
  // sweep covers any tick it crosses — same visual logic as the
  // reference dial.
  const tickLen = Math.max(3, Math.round(size * 0.04))
  const tickInset = stroke / 2 + 2
  const cardinals = [0, 90, 180, 270]

  // Centre typography scales with the dial so the same primitive reads
  // right at 80 px (Robot joint grid) and at 160 px (Speed rotazione).
  // 21 % leaves headroom for "359.9°" (six tabular glyphs) inside the
  // inner diameter, which is what triggers the worst-case overflow.
  const valueFontPx = Math.max(12, Math.round(size * 0.21))
  const labelFontPx = Math.max(10, Math.round(size * 0.095))

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
        {/* Cardinal ticks — under the arc so it overwrites them when it
         * sweeps past, matching the reference's "the arc cuts through
         * the tick" look. */}
        {cardinals.map((deg) => {
          const a = ((deg - 90) * Math.PI) / 180
          const outerR = r - tickInset
          const innerR = outerR - tickLen
          return (
            <line
              key={deg}
              x1={cx + Math.cos(a) * outerR}
              y1={cy + Math.sin(a) * outerR}
              x2={cx + Math.cos(a) * innerR}
              y2={cy + Math.sin(a) * innerR}
              stroke="currentColor"
              strokeWidth={Math.max(1.5, stroke * 0.18)}
              strokeLinecap="round"
              className={trackClassName}
            />
          )
        })}

        {/* Track — full circle in muted grey. */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={stroke}
          className={trackClassName}
        />

        {/* Progress arc — rounded caps mark both the fixed twelve-o'clock
         * origin and the live leading edge. Direction is implicit in
         * the convention (sweep clockwise from twelve), so no separate
         * arrowhead is needed — it would only add visual noise the HMI
         * actively wants to avoid. */}
        {showArc && (
          <path
            d={arcPath}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            className={progressClassName}
          />
        )}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span
          className="font-medium tabular-nums text-[var(--text-default)]"
          style={{ fontSize: valueFontPx, lineHeight: 1 }}
        >
          {value.toFixed(1)}°
        </span>
        {label ? (
          <span
            className="mt-1 text-[var(--text-muted)]"
            style={{ fontSize: labelFontPx }}
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  )
}
