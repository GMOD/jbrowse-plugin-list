import { groupKeyComparator } from '@jbrowse/core/util/groupKeys'

// Walk rows stacked into one section per value of a sample table's column,
// as jbrowse-plugin-tandem-repeat's "Group by…" stacks its alleles. Placement
// here, not in bandage-core's walkRowsTree, which puts row i at i * rowPx.

// One row of a samples TSV: the sample's name and a value per column
export type SampleRow = { name: string } & Record<string, string>

export interface WalkRowGroupBy {
  field: string
  domain?: string[]
}

export interface WalkRowSection {
  // '' for the rows with no value
  key: string
  title: string
  // index of the section's first row among the reference row and the rows
  first: number
  count: number
}

export const SECTION_HEADER_PX = 16

// A samples TSV as core's samplesTsv reads one: a header row, the sample's
// name in the first column, the first row of a repeated name kept. Hosts
// re-export that module only from v5.0.0-beta.11, so it is read here.
export function parseSamplesTsv(text: string): SampleRow[] {
  const [head = '', ...lines] = text.split(/\r\n|\r|\n/)
  const columns = head.split('\t').slice(1)
  const rows = new Map<string, SampleRow>()
  for (const line of lines) {
    if (!line) {
      continue
    }
    const [name = '', ...values] = line.split('\t')
    if (name && !rows.has(name)) {
      rows.set(name, {
        ...Object.fromEntries(columns.map((c, i) => [c, values[i] ?? ''])),
        name,
      })
    }
  }
  return [...rows.values()]
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

// The setting as a snapshot may hold it: a bare field name, or the object
export function groupByOf(value: unknown): WalkRowGroupBy | undefined {
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

function haplotypes(rows: { label: string }[]) {
  const n = new Set(rows.map(r => r.label)).size
  return `${n} haplotype${n === 1 ? '' : 's'}`
}

// The rows reordered section by section, each keeping the order it came in.
// A row's value is its table row's, looked up by haplotype (`HG00097#1`)
// and then by sample (`HG00097`); rows with none stack last.
export function groupWalkRows<R extends { sample: string; label: string }>(
  rows: R[],
  table: SampleRow[],
  { field, domain }: WalkRowGroupBy,
) {
  const valueOf = new Map(table.map(row => [row.name, row[field] ?? '']))
  const groups = new Map<string, R[]>()
  for (const row of rows) {
    const key = valueOf.get(row.label) || valueOf.get(row.sample) || ''
    const group = groups.get(key)
    if (group) {
      group.push(row)
    } else {
      groups.set(key, [row])
    }
  }
  let first = 1
  const sections: WalkRowSection[] = [...groups.keys()]
    .sort(groupKeyComparator(domain))
    .map(key => {
      const members = groups.get(key)!
      const section = {
        key,
        title: `${key || `${field}: none`} · ${haplotypes(members)}`,
        first,
        count: members.length,
      }
      first += members.length
      return section
    })
  return {
    rows: sections.flatMap(s => groups.get(s.key)!),
    sections,
  }
}

// Where rows and section headers sit, in px down from the reference row's
// centre, at one row pitch shared by every section: a header strip above
// each section's first row pushes every row after it down
export function sectionPlacement(sections: WalkRowSection[], rowPx: number) {
  const sectionOf = (i: number) => {
    let k = -1
    while (k + 1 < sections.length && sections[k + 1]!.first <= i) {
      k++
    }
    return k
  }
  const rowY = (i: number) => i * rowPx + (sectionOf(i) + 1) * SECTION_HEADER_PX
  return {
    rowY,
    headers: sections.map((s, k) => ({
      ...s,
      top: (s.first - 0.5) * rowPx + k * SECTION_HEADER_PX,
    })),
    headersPx: sections.length * SECTION_HEADER_PX,
    // the row whose centre is nearest y
    rowAt(y: number, rows: number) {
      let best = 0
      for (let k = -1; k < sections.length; k++) {
        const lo = k < 0 ? 0 : sections[k]!.first
        const hi =
          k < 0
            ? Math.min(rows, sections[0]?.first ?? rows)
            : lo + sections[k]!.count
        const shift = (k + 1) * SECTION_HEADER_PX
        const i = Math.min(
          hi - 1,
          Math.max(lo, Math.round((y - shift) / rowPx)),
        )
        if (Math.abs(rowY(i) - y) < Math.abs(rowY(best) - y)) {
          best = i
        }
      }
      return best
    },
  }
}
