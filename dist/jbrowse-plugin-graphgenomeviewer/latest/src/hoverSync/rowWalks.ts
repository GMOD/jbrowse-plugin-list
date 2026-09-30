import { panSNSample } from '@jbrowse/bandage-core/pansn'
import { pathOrigin } from '@jbrowse/bandage-core/pathAnchoring'

// A per-sample lane names its rows its own way: a phased callset `HG00097 HP0`,
// counting haplotypes from 0, a MAF `HG00097.1`, counting from 1 as PanSN does,
// and anything else by the bare sample
const PHASED_ROW = /^(.+) HP(\d+)$/
const DOTTED_ROW = /^(.+)\.(\d+)$/

// A bare sample can end in `.2` too, an accession for one, so each reading is
// tried in turn
function readings(row: string) {
  const phased = PHASED_ROW.exec(row)
  const dotted = DOTTED_ROW.exec(row)
  return [
    ...(phased
      ? [{ sample: phased[1]!, haplotype: String(Number(phased[2]) + 1) }]
      : []),
    ...(dotted ? [{ sample: dotted[1]!, haplotype: dotted[2] }] : []),
    { sample: row, haplotype: undefined },
  ]
}

function haplotypeOf(pathName: string) {
  return pathOrigin(pathName).name.split('#')[1]
}

// The walks a hovered lane row stands for: the one of its haplotype, or every
// walk of a bare sample. A cut often holds one haplotype of a sample, so a row
// naming the other matches nothing rather than the one it holds.
export function walksForRow(row: string, paths: readonly { name: string }[]) {
  const names = paths.map(p => p.name)
  for (const { sample, haplotype } of readings(row)) {
    const walks = names.filter(
      name =>
        panSNSample(pathOrigin(name).name) === sample &&
        (haplotype === undefined || haplotypeOf(name) === haplotype),
    )
    if (walks.length > 0) {
      return walks
    }
  }
  return []
}
