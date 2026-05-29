import { cn } from '@/lib/cn'

interface AngleDialProps {
  /**
   * Current angle in degrees. The marker sits at this position on the
   * ring (0° = twelve o'clock, clockwise). Negative values and values
   * past ±360° both render correctly — the SVG transform takes any
   * real number — while the centre readout preserves the original
   * sign because the operator wants to see "-90°" not "270°".
   */
  value: number
  /** Outer diameter in CSS pixels. */
  size?: number
  /**
   * Stroke width of the track ring. Default scales with the dial size
   * so proportions read the same at 80 px (Robot grid) and 200 px.
   */
  strokeWidth?: number
  /** Tailwind text-color class for the track ring + cardinal ticks. */
  trackClassName?: string
  /** Accessible name + visible caption under the centre value. */
  label?: string
  className?: string
}

const wrap360 = (n: number) => ((n % 360) + 360) % 360

/**
 * Position-marker angle dial. A muted ring with four cardinal ticks
 * carries a small two-piece marker pinned at the current angle:
 *
 *   - a soft tinted pill that overlays the ring at the marker spot,
 *     giving it visible presence at a glance from across the panel;
 *   - a saturated triangle just inside the ring, apex toward the
 *     centre, encoding the precise angular position.
 *
 * Why position-marker, not progress-arc-from-zero: for a continuously
 * rotating axis (Asse C, Ralla, robot joints), the orientation IS the
 * data. A sweep that grows from twelve o'clock to the angle is harder
 * to read at a glance — the eye has to find the leading edge along an
 * arc — than a single bright marker the eye can lock onto in one
 * saccade. Same principle as the needle on a real tachometer.
 *
 * The marker is drawn at twelve-o'clock geometry and rotated into
 * place via the SVG transform attribute (not CSS), so neither the
 * old transform-origin trap nor wrap discontinuities at 360°→0° apply.
 */
export function AngleDial({
  value,
  size = 120,
  strokeWidth,
  trackClassName = 'text-[var(--border-mute)]',
  label,
  className,
}: AngleDialProps) {
  const stroke = strokeWidth ?? Math.max(3, Math.round(size * 0.065))
  const wrapped = wrap360(value)
  const cx = size / 2
  const cy = size / 2

  // Marker proportions — derived from the stroke so a thicker ring
  // gets a proportionally larger marker. Stays readable from 80 px
  // (Robot joint dial) up to 200 px.
  const pillLength = stroke * 2.6
  const pillThickness = stroke * 1.05
  const triHeight = stroke * 0.95
  const triHalfBase = stroke * 0.55
  // Gap between the pill's inner edge (toward centre) and the
  // triangle's base.
  const triGap = stroke * 0.35

  // Pull the ring in just enough that the stroke doesn't kiss the
  // bounding edges.
  const r = size / 2 - stroke / 2 - 1

  // Cardinal tick geometry — short radial notches just inside the ring.
  const tickLen = Math.max(3, Math.round(size * 0.04))
  const tickInset = stroke / 2 + 2
  const cardinals = [0, 90, 180, 270]

  // Drawn at twelve o'clock; the <g> transform spins it to `value`.
  // Pill is centered on the ring perimeter (y = cy − r), tangent → wide.
  // Triangle sits INSIDE the ring (between ring and centre) with the
  // apex pointing OUTWARD — i.e. up toward the ring at 12 o'clock.
  // The marker reads as a compass mark on the inner rim pointing at
  // its angle. Geometry: base further from the ring (closer to centre,
  // larger Y at 12 o'clock), apex at the ring side (smaller Y).
  const pillX = cx - pillLength / 2
  const pillY = cy - r - pillThickness / 2
  // y of the pill's inner edge (toward dial centre).
  const pillInnerY = cy - r + pillThickness / 2
  const triApexY = pillInnerY + triGap
  const triBaseY = triApexY + triHeight
  const tipPoints = [
    `${cx - triHalfBase},${triBaseY}`,
    `${cx + triHalfBase},${triBaseY}`,
    `${cx},${triApexY}`,
  ].join(' ')

  // Centre typography scales with the dial. 21 % keeps "359.9°"
  // (six tabular figures) inside the inner ring with margin.
  const valueFontPx = Math.max(12, Math.round(size * 0.21))
  const labelFontPx = Math.max(10, Math.round(size * 0.095))

  // Restrained accent: the project's brand blue, two tones. Pale tint
  // (--accent-soft) on the pill so it overlays the ring without
  // dominating; saturated (--accent) on the triangle so the eye finds
  // the leading edge first. Same token the RangeBarRow fills with,
  // keeping every "this is live data" cue across the HMI on one hue.
  const pillFill = 'var(--accent-soft)'
  const markerFill = 'var(--accent)'

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
        {/* Cardinal ticks — drawn first so the marker overlays them when
         * it crosses one. */}
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

        {/* Track — full circle. */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={stroke}
          className={trackClassName}
        />

        {/* Position marker — drawn at twelve o'clock and rotated into
         * place. SVG transform attribute (no CSS) avoids the bounding-
         * box pivot trap. Passing the raw `value` (not `wrapped`) keeps
         * the marker visually continuous across 360°→0° transitions
         * for accumulating axes. */}
        <g transform={`rotate(${value} ${cx} ${cy})`}>
          <rect
            x={pillX}
            y={pillY}
            width={pillLength}
            height={pillThickness}
            rx={pillThickness / 2}
            fill={pillFill}
          />
          <polygon points={tipPoints} fill={markerFill} />
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span
          className="font-semibold tabular-nums text-[var(--text-default)]"
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
