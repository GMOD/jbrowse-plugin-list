import type { ProteinColor } from './proteinColor'

export interface ValueDomain {
  min: number
  max: number
}

const TRIM = 0.02

function rounded(value: number, span: number) {
  const scale = 10 ** Math.max(2, 1 - Math.floor(Math.log10(span)))
  return Math.round(value * scale) / scale
}

function stepBeside(value: number) {
  return value === 0
    ? 1
    : Math.min(1, 10 ** Math.floor(Math.log10(Math.abs(value))))
}

function stepPast(value: number, direction: 1 | -1) {
  const step = stepBeside(value)
  return rounded(value + direction * step, step)
}

/**
 * The span a ramp over `values` covers: the 2nd to 98th percentile, so one
 * outlier (a phyloP of -20 beside a protein of 0 to 8) does not flatten the
 * rest. Undefined for no values.
 */
export function valueDomain(values: Iterable<number>): ValueDomain | undefined {
  const sorted = [...values].filter(Number.isFinite).toSorted((a, b) => a - b)
  if (sorted.length === 0) {
    return undefined
  }
  const last = sorted.length - 1
  const low = sorted[Math.floor(TRIM * last)]!
  const high = sorted[Math.ceil((1 - TRIM) * last)]!
  const step = stepBeside(low)
  return high > low
    ? { min: rounded(low, high - low), max: rounded(high, high - low) }
    : { min: rounded(low, step), max: rounded(low + step, step) }
}

export function isValueField(color: ProteinColor) {
  return color.field === 'track' || color.field === 'values'
}

/**
 * The color object a theme paints with: for a field scaled by its data, any
 * end of the domain the session leaves out comes from `domain`, and the title
 * falls back to `label`. An end from the data that lands on the wrong side of
 * the session's moves one step past it, 1 or the end's own magnitude below 1:
 * a `domainMin` of 10 over values of 1 to 3 paints them all the low color
 * rather than reversing the ramp.
 */
export function paintedColor(
  color: ProteinColor,
  { domain, label }: { domain?: ValueDomain; label?: string },
): ProteinColor {
  if (!isValueField(color)) {
    return color
  }
  const fromData = color.scale !== 'threshold'
  const dataMin = fromData ? domain?.min : undefined
  const dataMax = fromData ? domain?.max : undefined
  const given = { min: color.domainMin, max: color.domainMax }
  const min =
    given.min ??
    (dataMin !== undefined && given.max !== undefined && dataMin >= given.max
      ? stepPast(given.max, -1)
      : dataMin)
  const max =
    given.max ??
    (dataMax !== undefined && min !== undefined && dataMax <= min
      ? stepPast(min, 1)
      : dataMax)
  const title = color.title ?? label
  return {
    ...color,
    ...(min === undefined ? {} : { domainMin: min }),
    ...(max === undefined ? {} : { domainMax: max }),
    ...(title === undefined ? {} : { title }),
  }
}
