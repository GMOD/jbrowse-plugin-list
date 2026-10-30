import { walkRowsTree } from '@jbrowse/bandage-core/layout/walkRowDraw'
import { groupKeyComparator } from '@jbrowse/core/util/groupKeys'

import type { El } from '@jbrowse/bandage-core/el'
import type {
  WalkRowsFrame,
  WalkRowsWithCalls,
} from '@jbrowse/bandage-core/layout/walkRowDraw'

// Walk rows stacked into one section per value of a sample table's column,
// as jbrowse-plugin-tandem-repeat's "Group by…" stacks its alleles. Placement
// here, not in bandage-core's walkRowsTree, which puts row i at i * rowPx.

// One row of a samples TSV: the sample's name and a value per column
export type SampleRow = { name: string } & Record<string, string>

export interface WalkRowGroupBy {
  field: string
  sort?: string[]
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
  // `domain` is the facet's order through 7.x
  const { field, sort, domain } = (value ?? {}) as Record<string, unknown>
  if (typeof field !== 'string' || !field) {
    return undefined
  }
  const order = sort ?? domain
  return Array.isArray(order)
    ? { field, sort: order.filter(d => typeof d === 'string') }
    : { field }
}

export function plural(n: number, noun: string) {
  return `${n} ${noun}${n === 1 ? '' : 's'}`
}

// A walk's value in a column: its haplotype's row (`HG00097#1`), else its
// sample's (`HG00097`), else ''
export function columnValueOf(field: string, table: SampleRow[]) {
  const valueOf = new Map(table.map(row => [row.name, row[field] ?? '']))
  return (haplotype: string, sample: string) =>
    valueOf.get(haplotype) || valueOf.get(sample) || ''
}

// Items grouped by their value in a column, each group in the order its items
// came in, the groups in the order a JBrowse Group by sorts them, and each
// titled with its value and how many distinct `noun`s its items are
export function groupsByColumn<T>(
  items: readonly T[],
  valueOf: (item: T) => string,
  { field, sort }: { field: string; sort?: readonly string[] },
  noun: string,
  nounOf: (item: T) => string,
) {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const key = valueOf(item)
    const group = groups.get(key)
    if (group) {
      group.push(item)
    } else {
      groups.set(key, [item])
    }
  }
  return [...groups.keys()].sort(groupKeyComparator(sort)).map(key => {
    const members = groups.get(key)!
    const n = new Set(members.map(nounOf)).size
    return {
      key,
      members,
      title: `${key || `${field}: none`} · ${plural(n, noun)}`,
    }
  })
}

// The rows reordered section by section; rows with no value stack last
export function groupWalkRows<R extends { sample: string; label: string }>(
  rows: R[],
  table: SampleRow[],
  groupBy: WalkRowGroupBy,
) {
  const valueOf = columnValueOf(groupBy.field, table)
  const groups = groupsByColumn(
    rows,
    row => valueOf(row.label, row.sample),
    groupBy,
    'haplotype',
    row => row.label,
  )
  let first = 1
  const sections: WalkRowSection[] = groups.map(({ key, members, title }) => {
    const section = { key, title, first, count: members.length }
    first += members.length
    return section
  })
  return {
    rows: groups.flatMap(g => g.members),
    sections,
  }
}

export const sectionHeadersPx = (sections: WalkRowSection[]) =>
  sections.length * SECTION_HEADER_PX

// The index among `sections` of the one row i stacks in, -1 for the reference
// row above them all
export function sectionIndexOf(sections: WalkRowSection[], i: number) {
  return sections.findLastIndex(s => s.first <= i)
}

// Where rows and section headers sit, in px down from the reference row's
// centre, at one row pitch shared by every section: a header strip above
// each section's first row pushes every row after it down
export function sectionPlacement(sections: WalkRowSection[], rowPx: number) {
  const rowY = (i: number) =>
    i * rowPx + (sectionIndexOf(sections, i) + 1) * SECTION_HEADER_PX
  return {
    rowY,
    headers: sections.map((s, k) => ({
      ...s,
      top: (s.first - 0.5) * rowPx + k * SECTION_HEADER_PX,
    })),
    headersPx: sectionHeadersPx(sections),
    // runs of `rows` rows each spaced one pitch apart: the reference row and
    // each section, or every row while ungrouped
    blocks(rows: number) {
      return sections.length
        ? [
            { first: 0, count: 1, rowY: 0 },
            ...sections.map(s => ({
              first: s.first,
              count: s.count,
              rowY: rowY(s.first),
            })),
          ]
        : [{ first: 0, count: rows, rowY: 0 }]
    },
    // the row whose centre is nearest y, the upper of two as near
    rowAt(y: number, rows: number) {
      let lo = 0
      let hi = rows - 1
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (rowY(mid) < y) {
          lo = mid + 1
        } else {
          hi = mid
        }
      }
      return lo > 0 && y - rowY(lo - 1) <= rowY(lo) - y ? lo - 1 : lo
    },
  }
}

// The rows' trees, a section at a time while grouped. walkRowsTree puts its
// i-th row at i * rowPx below its reference row and draws that row too, so
// each section is drawn shifted down to its place with its reference row
// dropped.
export function walkRowTrees(
  bars: WalkRowsWithCalls,
  sections: WalkRowSection[],
  rowY: (i: number) => number,
  frame: WalkRowsFrame & { rowPx: number },
  o: Parameters<typeof walkRowsTree>[2] & { idPrefix: string },
): El[] {
  return sections.length === 0
    ? [walkRowsTree(bars, frame, o)]
    : [
        walkRowsTree({ ...bars, rows: [] }, frame, o),
        ...sections.flatMap((section, k) => {
          const tree = walkRowsTree(
            {
              ...bars,
              rows: bars.rows.slice(
                section.first - 1,
                section.first - 1 + section.count,
              ),
            },
            {
              ...frame,
              translateY:
                frame.translateY +
                (rowY(section.first) - frame.rowPx) * frame.scaleY,
            },
            { ...o, idPrefix: `${o.idPrefix}-s${k}` },
          )
          return tree.children.filter(
            (c): c is El =>
              typeof c !== 'string' &&
              c.attrs['data-testid'] !== 'graph-walk-reference',
          )
        }),
      ]
}
