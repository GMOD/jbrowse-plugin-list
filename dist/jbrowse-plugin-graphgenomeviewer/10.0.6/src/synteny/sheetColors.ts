import { panSNHaplotype, panSNSample } from '@jbrowse/bandage-core/pansn'
import { hexRgb } from '@jbrowse/bandage-core/walkEncoding'

import { laneAssemblyName } from './lanePairs.ts'

import type { SamplesTsvRow } from '@jbrowse/core/util/samplesTsv'

/**
 * A haplotype's `color` in a samples sheet, for a walk or a `sample#hap`
 * prefix: its haplotype's row (`HG002#1`), else its sample's (`HG002`), else
 * the row whose `assembly` is the assembly its lane draws on. Only a #rgb or
 * #rrggbb colour counts, the one a lifted walk can paint, so a lane and its
 * thread agree.
 */
export function sheetColorOf(
  rows: readonly SamplesTsvRow[],
  asmByPrefix: Record<string, string>,
) {
  const byName = new Map<string, string>()
  const byAssembly = new Map<string, string>()
  for (const { name, color, assembly } of rows) {
    if (color && hexRgb(color)) {
      byName.set(name, color)
      if (assembly && !byAssembly.has(assembly)) {
        byAssembly.set(assembly, color)
      }
    }
  }
  return (name: string) => {
    const haplotype = panSNHaplotype(name) ?? name
    return (
      byName.get(haplotype) ??
      byName.get(panSNSample(haplotype)) ??
      byAssembly.get(laneAssemblyName(asmByPrefix, haplotype))
    )
  }
}
