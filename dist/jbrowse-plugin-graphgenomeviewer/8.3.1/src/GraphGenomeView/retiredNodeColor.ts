import { isRecord } from '../isRecord'

// Where each member of the flat color object sits in the channel object, as
// display-kit's `liftFlatColor` places it
const FLAT_MEMBERS: Readonly<
  Record<string, readonly ['scale' | 'legend', string]>
> = {
  scale: ['scale', 'type'],
  domain: ['scale', 'domain'],
  range: ['scale', 'range'],
  labels: ['scale', 'names'],
  scheme: ['scale', 'scheme'],
  reverse: ['scale', 'reverse'],
  domainMin: ['scale', 'domainMin'],
  domainMax: ['scale', 'domainMax'],
  domainMid: ['scale', 'domainMid'],
  domainQuantile: ['scale', 'domainQuantile'],
  unknown: ['scale', 'unknown'],
  title: ['legend', 'title'],
  descending: ['legend', 'descending'],
}

function isFlat(color: Record<string, unknown>) {
  return Object.entries(color).some(
    ([key, value]) =>
      key in FLAT_MEMBERS && !(key === 'scale' && isRecord(value)),
  )
}

/**
 * @deprecated The node color through 7.5.0, a bare `'grey'` or `'uniform'` or a
 * flat object (`scale: 'categorical'`, `scheme`, `domainMin`, `domainMax`
 * beside `field`), lifted to the channel object: the constants become
 * `value`, scale members go under `scale` and `categorical` becomes
 * `ordinal`. Covers a LinearGraphDisplay's `color` and a GraphGenomeView's
 * saved `color`. Goes once no saved session or hosted config predates `encoding.color`.
 */
export function liftFlatNodeColor(color: unknown): unknown {
  if (typeof color === 'string') {
    return { value: color }
  }
  if (!isRecord(color) || !isFlat(color)) {
    return color
  }
  const out: Record<string, unknown> = {}
  const parts: Record<'scale' | 'legend', Record<string, unknown>> = {
    scale: {},
    legend: {},
  }
  for (const [key, value] of Object.entries(color)) {
    const at = FLAT_MEMBERS[key]
    if (!at || (key === 'scale' && isRecord(value))) {
      out[key] = value
    } else if (value !== undefined) {
      parts[at[0]][at[1]] =
        key === 'scale' && value === 'categorical' ? 'ordinal' : value
    }
  }
  for (const part of ['scale', 'legend'] as const) {
    if (Object.keys(parts[part]).length > 0) {
      const nested = out[part]
      out[part] = { ...parts[part], ...(isRecord(nested) ? nested : {}) }
    }
  }
  return out
}

/**
 * @deprecated A LinearGraphDisplay's flat `color` as `encoding.color`, for
 * the schema's `retired`. Goes with `liftFlatNodeColor`.
 */
export const retiredGraphColor = {
  color: (color: unknown) => ({
    encoding: { color: liftFlatNodeColor(color) },
  }),
}
