// One row of a track's samples TSV, as the variants plugin reads it: the VCF
// sample's name and a value per column
export type SampleRow = { name: string } & Record<string, string>

export interface Facet {
  field: string
  domain?: string[]
}

// What a multi-sample variant display adds to its rows for its own drawing
const DISPLAY_FIELDS = new Set([
  'name',
  'baseUri',
  'label',
  'labelColor',
  'sampleName',
  'color',
  'group',
  'HP',
])

function text(value: unknown) {
  return typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
    ? String(value)
    : undefined
}

// One row per sample from the variants plugin's sources, which a phased
// display expands to a row per haplotype; undefined when no row carries a
// column beyond the sample's name
export function sampleRowsOf(sources: unknown) {
  if (!Array.isArray(sources)) {
    return undefined
  }
  const rows = new Map<string, SampleRow>()
  let columns = false
  for (const source of sources as Record<string, unknown>[]) {
    const name = text(source.sampleName) ?? text(source.name)
    if (name === undefined || rows.has(name)) {
      continue
    }
    const row: SampleRow = { name }
    for (const [key, value] of Object.entries(source)) {
      const t = text(value)
      if (!DISPLAY_FIELDS.has(key) && t !== undefined) {
        row[key] = t
        columns = true
      }
    }
    rows.set(name, row)
  }
  return columns ? [...rows.values()] : undefined
}

export function metadataColumns(rows: SampleRow[] | undefined) {
  const columns = new Set<string>()
  for (const row of rows ?? []) {
    for (const key of Object.keys(row)) {
      if (key !== 'name') {
        columns.add(key)
      }
    }
  }
  return [...columns]
}

// A facet as a snapshot may hold it: a bare field name, or the object
export function facetOf(value: unknown): Facet | undefined {
  if (typeof value === 'string') {
    return value ? { field: value } : undefined
  }
  const { field, domain } = (value ?? {}) as Record<string, unknown>
  if (typeof field !== 'string' || !field) {
    return undefined
  }
  return Array.isArray(domain)
    ? { field, domain: domain.filter(d => typeof d === 'string') }
    : { field }
}
