import { cn } from '@/lib/cn'

interface SparklineProps {
  /** Time-ordered samples (oldest → newest). */
  values: number[]
  /** Y-axis lower bound. Auto-fits to data when omitted. */
  min?: number
  /** Y-axis upper bound. Auto-fits to data when omitted. */
  max?: number
  /** Rendered pixel height (the SVG fills its parent's width). */
  height?: number
  className?: string
}

const VB_WIDTH = 100
const PAD_Y = 4
// Subtle marker dot at the latest point — sized in viewBox units so
// preserveAspectRatio="none" doesn't squash it horizontally.
const DOT_R = 1.6

/**
 * Minimal horizontal sparkline: a polyline through `values` and a
 * single accent dot pinned at the most recent point.
 *
 * Stateless on purpose — the caller (e.g. TimeSeriesRow) owns the
 * rolling window. Auto-scales vertically when min/max are omitted; an
 * explicit range is better for HMI gauges that need a stable reading
 * across sessions, but a sparkline next to a numeric readout is more
 * useful when it stretches to show variance.
 *
 * Uses preserveAspectRatio="none" so the polyline fills the available
 * horizontal space without stretching the stroke (the polyline and dot
 * carry vector-effect="non-scaling-stroke" + a fixed-size circle).
 */
export function Sparkline({
  values,
  min,
  max,
  height = 64,
  className,
}: SparklineProps) {
  if (values.length === 0) {
    return <div style={{ height }} className={className} aria-hidden />
  }

  const yMin = min ?? Math.min(...values)
  const yMax = max ?? Math.max(...values)
  const yRange = yMax - yMin || 1
  const vbH = height

  const points = values
    .map((v, i) => {
      const x =
        values.length === 1 ? VB_WIDTH : (i / (values.length - 1)) * VB_WIDTH
      const y = vbH - PAD_Y - ((v - yMin) / yRange) * (vbH - 2 * PAD_Y)
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  const last = values.length - 1
  const lastV = values[last]!
  const dotX = VB_WIDTH
  const dotY = vbH - PAD_Y - ((lastV - yMin) / yRange) * (vbH - 2 * PAD_Y)

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${VB_WIDTH} ${vbH}`}
      preserveAspectRatio="none"
      className={cn('block', className)}
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="text-[var(--text-default)]"
      />
      <circle cx={dotX} cy={dotY} r={DOT_R} fill="oklch(0.50 0.18 250)" />
    </svg>
  )
}
