import { useState } from 'react'
import { Sparkline } from '@/components/primitives/sparkline'
import { Text } from '@/components/primitives/text'
import { cn } from '@/lib/cn'

interface TimeSeriesRowProps {
  /** Left-hand label (mirrors DataRow). */
  label: string
  /** Current sample. The component accumulates a rolling buffer
   * across prop changes. */
  value: number
  /** Unit suffix appended to the right-hand readout (e.g. "mm/s"). */
  unit?: string
  /**
   * Maximum samples retained. Older samples are dropped FIFO. The
   * machine-store tick runs at ~10 Hz, so 300 samples ≈ a 30 s window.
   */
  maxSamples?: number
  /** Fixed y-axis lower bound. Auto-fits when omitted. */
  min?: number
  /** Fixed y-axis upper bound. Auto-fits when omitted. */
  max?: number
  /** Pixel height of the sparkline. */
  height?: number
  /** Formatter for the right-hand readout. Default rounds to int. */
  format?: (v: number) => string
  className?: string
}

interface BufferState {
  /** Last `value` prop we ingested — guards against double-appends on
   * React's strict-mode double-renders and is the trigger for window
   * advance. */
  lastValue: number
  history: number[]
}

/**
 * Label + current-value row with a horizontal sparkline beneath,
 * fed by a fixed-length rolling buffer of the value prop. Drop-in for
 * a DataRow when the operator needs trend (where is this heading)
 * alongside the instantaneous reading.
 *
 * History lives in component state. We adjust state during render
 * when the `value` prop changes — React's documented pattern for
 * 'storing information from previous renders' — instead of running
 * setState inside a useEffect, which would cost an extra render per
 * tick (the lint rule react-hooks/set-state-in-effect flags this for
 * the same reason). No Date.now anywhere: a ring buffer of fixed
 * length is what a sparkline needs, and the machine-store tick is
 * already a stable clock.
 */
export function TimeSeriesRow({
  label,
  value,
  unit,
  maxSamples = 300,
  min,
  max,
  height = 64,
  format = (v) => Math.round(v).toString(),
  className,
}: TimeSeriesRowProps) {
  const [buffer, setBuffer] = useState<BufferState>(() => ({
    lastValue: value,
    history: [value],
  }))
  if (buffer.lastValue !== value) {
    const next =
      buffer.history.length >= maxSamples
        ? [...buffer.history.slice(buffer.history.length - maxSamples + 1), value]
        : [...buffer.history, value]
    setBuffer({ lastValue: value, history: next })
  }

  const readout = `${format(value)}${unit ? ` ${unit}` : ''}`

  return (
    <div className={cn('flex flex-col gap-2 py-1.5', className)}>
      <div className="flex items-baseline justify-between">
        <Text variant="sm/normal" className="text-[var(--text-muted)]">
          {label}
        </Text>
        <Text
          variant="sm/normal"
          className="text-[var(--text-default)] tabular-nums"
        >
          {readout}
        </Text>
      </div>
      <Sparkline values={buffer.history} min={min} max={max} height={height} />
    </div>
  )
}
