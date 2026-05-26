/**
 * Move `current` toward `target` at `rate` units per second over `dtMs`
 * milliseconds. Snaps to the target when the remaining distance is
 * within `eps` (or within one step, whichever is larger) — avoids
 * floating-point dithering near the destination.
 */
export function lerpToward(
  current: number,
  target: number,
  rate: number,
  dtMs: number,
  eps = 0.001,
): number {
  const dt = dtMs / 1000
  const step = rate * dt
  if (Math.abs(target - current) <= Math.max(eps, step)) return target
  return current + Math.sign(target - current) * step
}
