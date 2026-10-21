import { colord } from '@jbrowse/core/util/colord'

/**
 * A color object as jbrowse-components' grammar spells one (ADR-151): the
 * `field` it reads, the `scale` from the field's values to a color, and that
 * scale's members. Every surface that paints a field reads its one object.
 */
export interface CategoricalColor {
  field: string
  scale: 'categorical'
  domain: readonly string[]
  range: readonly string[]
  /** The key's name for each `domain` value, in order. */
  labels?: readonly string[]
  /** The color of a value `domain` leaves out. */
  unknown?: string
  title?: string
}

/**
 * `domain` holds ascending cut points and `range` one color more; a value on a
 * cut takes the interval above it.
 */
export interface ThresholdColor {
  field: string
  scale: 'threshold'
  domain: readonly number[]
  range: readonly string[]
  /** The key's name for each interval, from the lowest. */
  labels?: readonly string[]
  title?: string
}

/**
 * `range` spaced evenly from `domainMin` to `domainMax`. With `domainMid` the
 * middle stop sits there, the farther end reaches its end color, and equal
 * distances from the middle take equal colors.
 */
export interface LinearColor {
  field: string
  scale: 'linear'
  domainMin: number
  domainMax: number
  domainMid?: number
  range: readonly string[]
  /** The key's names for `domainMin` and `domainMax`. */
  labels?: readonly [string, string]
  title?: string
}

export type ScaledColor = CategoricalColor | ThresholdColor | LinearColor

export type Rgb = readonly [number, number, number]

/** A CSS color as RGB. */
export function rgbOf(css: string): Rgb {
  const { r, g, b } = colord(css).toRgb()
  return [r, g, b]
}

function cssOf([r, g, b]: Rgb) {
  return `rgb(${r}, ${g}, ${b})`
}

function numberOf(value: unknown) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : undefined
}

/** How many of the ascending cuts `value` is at or past. */
export function thresholdIndex(domain: readonly number[], value: number) {
  let i = 0
  while (i < domain.length && value >= domain[i]!) {
    i++
  }
  return i
}

function rampPosition(color: LinearColor, value: number) {
  const { domainMin, domainMax, domainMid } = color
  const p =
    domainMid === undefined
      ? (value - domainMin) / (domainMax - domainMin)
      : 0.5 +
        (value - domainMid) /
          (2 * Math.max(domainMid - domainMin, domainMax - domainMid))
  return Math.max(0, Math.min(1, p))
}

function rampRgb(color: LinearColor) {
  const stops = color.range.map(rgbOf)
  const segments = stops.length - 1
  return (value: number): Rgb => {
    const p = rampPosition(color, value) * segments
    const i = Math.min(Math.floor(p), Math.max(segments - 1, 0))
    const from = stops[i]!
    const to = stops[i + 1] ?? from
    const f = p - i
    const mix = (c: 0 | 1 | 2) => Math.round(from[c] + (to[c] - from[c]) * f)
    return [mix(0), mix(1), mix(2)]
  }
}

/**
 * The CSS color `color` paints a value, undefined for a value it has none
 * for: a number missing under a threshold or linear scale, or a categorical
 * value `domain` leaves out where `unknown` is unset.
 */
export function cssScaleOf(
  color: ScaledColor,
): (value: unknown) => string | undefined {
  if (color.scale === 'categorical') {
    const { domain, range, unknown } = color
    return value => {
      const i = domain.indexOf(String(value))
      return (i === -1 ? undefined : range[i]) ?? unknown
    }
  }
  if (color.scale === 'threshold') {
    const { domain, range } = color
    return value => {
      const v = numberOf(value)
      return v === undefined ? undefined : range[thresholdIndex(domain, v)]
    }
  }
  const ramp = rampRgb(color)
  return value => {
    const v = numberOf(value)
    return v === undefined ? undefined : cssOf(ramp(v))
  }
}

/** {@link cssScaleOf} as RGB, for a painter that takes numbers. */
export function rgbScaleOf(
  color: ScaledColor,
): (value: unknown) => Rgb | undefined {
  if (color.scale === 'linear') {
    const ramp = rampRgb(color)
    return value => {
      const v = numberOf(value)
      return v === undefined ? undefined : ramp(v)
    }
  }
  const css = cssScaleOf(color)
  const parsed = new Map<string, Rgb>()
  return value => {
    const c = css(value)
    if (c === undefined) {
      return undefined
    }
    let rgb = parsed.get(c)
    if (!rgb) {
      rgb = rgbOf(c)
      parsed.set(c, rgb)
    }
    return rgb
  }
}

function thresholdLabel(domain: readonly number[], i: number) {
  return i === 0
    ? `< ${domain[0]}`
    : i === domain.length
      ? `≥ ${domain[i - 1]}`
      : `${domain[i - 1]}–${domain[i]}`
}

/** A categorical or threshold key: one entry per `domain` value or interval. */
export function keyEntriesOf(color: CategoricalColor | ThresholdColor) {
  const { labels = [], range } = color
  return color.scale === 'categorical'
    ? color.domain.map((value, i) => ({
        label: labels[i] ?? value,
        color: range[i] ?? color.unknown ?? '',
      }))
    : range.map((c, i) => ({
        label: labels[i] ?? thresholdLabel(color.domain, i),
        color: c,
      }))
}

/** A ramp's key: its two ends named, and one color per `range` stop across the domain. */
export function rampKeyOf(color: LinearColor) {
  const { domainMin, domainMax, range } = color
  const [minLabel = `${domainMin}`, maxLabel = `${domainMax}`] =
    color.labels ?? []
  const css = cssScaleOf(color)
  const n = Math.max(range.length - 1, 1)
  return {
    minLabel,
    maxLabel,
    colors: range.map(
      (_, i) => css(domainMin + ((domainMax - domainMin) * i) / n) ?? '',
    ),
  }
}
