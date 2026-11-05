import { cssScaleOf } from './colorScale'

const RAMP = ['#d7191c', '#fdae61', '#abd9e9', '#2c7bb6']

const FIXED: Record<number, string[]> = {
  2: ['#d7191c', '#2c7bb6'],
  3: ['#d7191c', '#fdae61', '#abd9e9'],
  4: RAMP,
}

/**
 * Colors for a threshold scale's intervals from the lowest up: red for the
 * lowest, blue for the highest.
 */
export function thresholdRange(intervals: number): string[] {
  const fixed = FIXED[intervals]
  if (fixed) {
    return fixed
  }
  const paint = cssScaleOf({
    field: 'palette',
    scale: 'linear',
    domainMin: 0,
    domainMax: 1,
    range: RAMP,
  })
  return Array.from(
    { length: Math.max(intervals, 1) },
    (_, i) => paint(intervals > 1 ? i / (intervals - 1) : 0) ?? RAMP[0]!,
  )
}

/** The ascending cuts typed as `-1.328, -0.748`; undefined if they are not. */
export function parseCuts(text: string): number[] | undefined {
  const cuts = text
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(Number)
  return cuts.length > 0 &&
    cuts.every((c, i) => Number.isFinite(c) && (i === 0 || c > cuts[i - 1]!))
    ? cuts
    : undefined
}
