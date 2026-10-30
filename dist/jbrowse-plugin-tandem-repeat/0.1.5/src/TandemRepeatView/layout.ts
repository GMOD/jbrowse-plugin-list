import { groupKeyComparator } from '@jbrowse/core/util/groupKeys'

import type { Facet, SampleRow } from '../sampleMetadata'
import type { RepeatAllele, RepeatUnit } from '../tandemRepeat'

export interface CopyBox {
  // bp from the allele's left end
  start: number
  bp: number
  unit: number
}

// Each copy an allele's runs state. RUB gives each copy's bases; without it a
// whole count splits its run evenly, and a fractional count takes whole units
// with the remainder last.
export function copiesOf(allele: RepeatAllele, units: RepeatUnit[]) {
  const boxes: CopyBox[] = []
  let at = 0
  for (const run of allele.runs ?? []) {
    const n = Math.ceil(run.count)
    const each = Number.isInteger(run.count)
      ? run.bp / n
      : (units[run.unit]?.length ?? run.bp / run.count)
    const lengths =
      run.copyBp ??
      Array.from({ length: n }, (_, i) =>
        i < n - 1 ? each : run.bp - each * (n - 1),
      )
    for (const bp of lengths) {
      boxes.push({ start: at, bp, unit: run.unit })
      at += bp
    }
  }
  return boxes
}

// A unit's name where the record gives one, else its rank by copies
export function unitLabel(units: RepeatUnit[], i: number) {
  return units[i]?.name ?? `unit ${i + 1}`
}

export const ROW_PX = 22
export const BAR_PX = 12
const ROWS_MAX_PX = 30 * ROW_PX
const LABEL_MIN_PX = 11

// More rows than fit the plot's height squash into it, below a pixel if need
// be, rather than growing the view; rows too thin for a label draw unlabelled,
// their bars touching.
export function rowLayout(rows: number) {
  const rowPx = Math.min(ROW_PX, ROWS_MAX_PX / Math.max(1, rows))
  const labelled = rowPx >= LABEL_MIN_PX
  return {
    rowPx,
    barPx: labelled ? (rowPx * BAR_PX) / ROW_PX : rowPx,
    labelled,
  }
}

// Rows too many to label sort by their copies of the record's rarest unit,
// then longest first, so the alleles carrying it gather into one band. A
// record of one unit sorts longest first.
export function squeezedOrder(alleles: RepeatAllele[], units: RepeatUnit[]) {
  const rarest = units.length > 1 ? units.length - 1 : undefined
  const carried = (allele: RepeatAllele) =>
    rarest === undefined
      ? 0
      : (allele.runs ?? [])
          .filter(run => run.unit === rarest)
          .reduce((sum, run) => sum + run.count, 0)
  return {
    rows: [...alleles].sort((a, b) => carried(b) - carried(a) || b.bp - a.bp),
    rule:
      rarest === undefined
        ? 'longest first'
        : `most ${unitLabel(units, rarest)} first, then longest`,
  }
}

export const SECTION_HEADER_PX = 16

export interface FacetSection {
  // '' for the rows with no value
  key: string
  title: string
  // px below the ruler where the section's header strip starts
  top: number
  rows: RepeatAllele[]
}

function haplotypes(n: number) {
  return `${n} haplotype${n === 1 ? '' : 's'}`
}

// The rows stacked into one section per value of a samples TSV column, its
// sample's row deciding each allele's; rows with no value stack last. Every
// section shares one row pitch, so a section's height follows its row count.
// Unfaceted, one section without a header holds every row.
export function facetSections(
  alleles: RepeatAllele[],
  units: RepeatUnit[],
  samples: SampleRow[] | undefined,
  facet: Facet | undefined,
) {
  const pitch = rowLayout(alleles.length)
  const { labelled } = pitch
  const squeezed = squeezedOrder(alleles, units)
  const ordered = labelled ? alleles : squeezed.rows
  const squeezedRule = labelled ? undefined : squeezed.rule
  if (!facet) {
    return {
      ...pitch,
      rule: squeezedRule,
      sections: [{ key: '', title: '', top: 0, rows: ordered }],
      rowsPx: alleles.length * pitch.rowPx,
    }
  }
  const { field, domain } = facet
  const valueOf = new Map(samples?.map(row => [row.name, row[field] ?? '']))
  const groups = new Map<string, RepeatAllele[]>()
  for (const allele of ordered) {
    const key = (allele.sample && valueOf.get(allele.sample)) || ''
    const group = groups.get(key)
    if (group) {
      group.push(allele)
    } else {
      groups.set(key, [allele])
    }
  }
  let top = 0
  const sections = [...groups.keys()]
    .sort(groupKeyComparator(domain))
    .map(key => {
      const rows = groups.get(key)!
      const section = {
        key,
        title: `${key || `${field}: none`} · ${haplotypes(rows.length)}`,
        top,
        rows,
      }
      top += SECTION_HEADER_PX + rows.length * pitch.rowPx
      return section
    })
  return {
    ...pitch,
    rule: `grouped by ${field}${squeezedRule ? `, within each ${squeezedRule}` : ''}`,
    sections,
    rowsPx: top,
  }
}

export function copyCount(allele: RepeatAllele) {
  return allele.runs?.reduce((sum, run) => sum + run.count, 0)
}

export function formatBp(bp: number) {
  if (bp < 1000) {
    return `${Math.round(bp)} bp`
  }
  return `${(bp / 1000).toFixed(bp < 10_000 ? 1 : 0)} kb`
}

function formatCount(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

// What the end of a bar says: its length, its copies where runs state them or
// its length in units for the reference allele, and its difference from the
// reference allele
export function readout(
  allele: RepeatAllele,
  referenceBp: number,
  unitLength: number | undefined,
) {
  const copies = copyCount(allele)
  const counted =
    copies !== undefined
      ? ` · ${formatCount(copies)} copies`
      : unitLength
        ? ` ≈ ${Math.round(allele.bp / unitLength)} units`
        : ''
  const delta = allele.bp - referenceBp
  const against =
    delta === 0 ? '' : ` (${delta > 0 ? '+' : '−'}${formatBp(Math.abs(delta))})`
  return `${formatBp(allele.bp)}${counted}${against}`
}

// Round positions for a ruler over [0, max]: steps of 1, 2 or 5 times a power
// of ten, about `target` of them.
export function axisTicks(max: number, target = 6) {
  if (!(max > 0)) {
    return [0]
  }
  const raw = max / target
  const power = 10 ** Math.floor(Math.log10(raw))
  const step =
    [1, 2, 5, 10].map(m => m * power).find(s => s >= raw) ?? 10 * power
  const ticks: number[] = []
  for (let t = 0; t <= max; t += step) {
    ticks.push(t)
  }
  return ticks
}
