import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface GaugeProps {
  /** 0–100. Clamped internally. */
  value: number
  size?: number
  strokeWidth?: number
  /** Size of the opening at the bottom, in degrees. */
  gapDegrees?: number
  /** Tailwind text-color class for the progress arc (uses currentColor). */
  progressClassName?: string
  trackClassName?: string
  rounded?: boolean
  /** Accessible name for the meter. */
  label?: string
  /** Small text rendered under the centre value. */
  caption?: ReactNode
  className?: string
}

/**
 * Open-bottom radial gauge (≈270° by default). Two concentric SVG
 * arcs — a static track and a progress arc whose dash offset encodes
 * the value — with the value shown as a percentage in the centre.
 *
 * Pure SVG + a CSS transition on the dash offset, so a live value that
 * ticks toward its target sweeps smoothly without a motion library.
 * Adapted from animata.design's gauge-chart.
 */
export function Gauge({
  value,
  size = 188,
  strokeWidth = 16,
  gapDegrees = 90,
  progressClassName = 'text-[var(--text-default)]',
  trackClassName = 'text-[var(--border-mute)]',
  rounded = true,
  label,
  caption,
  className,
}: GaugeProps) {
  const pct = value < 0 ? 0 : value > 100 ? 100 : value
  const radius = size / 2 - strokeWidth
  const circumference = Math.PI * radius * 2
  const gap = circumference * (gapDegrees / 360)
  // Centre the opening at the bottom of the dial.
  const rotation = 90 + gapDegrees / 2
  const progressOffset = circumference - (pct / 100) * (circumference - gap)

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
      className={cn('relative', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap={rounded ? 'round' : 'butt'}
          strokeDasharray={circumference}
          strokeDashoffset={gap}
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          className={trackClassName}
        />
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap={rounded ? 'round' : 'butt'}
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          className={progressClassName}
          style={{ transition: 'stroke-dashoffset 300ms ease-out' }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span
          className="font-medium tabular-nums text-[var(--text-default)]"
          // Shrink for the wider 3-digit "100%" so the value never
          // crowds the arc; roomier for the common 2-digit readings.
          style={{ fontSize: size / (value >= 100 ? 5.6 : 4.6) }}
        >
          {Math.round(pct)}%
        </span>
        {caption ? (
          <span className="mt-1 text-[12px] text-[var(--text-muted)]">{caption}</span>
        ) : null}
      </div>
    </div>
  )
}
