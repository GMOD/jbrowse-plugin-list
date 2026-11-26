import { parsePanSN } from '@jbrowse/bandage-core/pansn'
import { pathOrigin } from '@jbrowse/bandage-core/pathAnchoring'
import { encodingStops } from '@jbrowse/bandage-core/walkEncoding'

import type { WalkEncoding } from '@jbrowse/bandage-core/walkEncoding'

// The colour each haplotype drawn in one colour takes, by its PanSN sample and
// haplotype, absent for a walk named by its bare sample, which a variant
// display in the same linear view reads as `haplotypeColors` to colour that
// haplotype's row label (jbrowse-components'
// agent-docs/reference/PLUGIN_ABI_STABILITY.md). A folded thread colours every
// haplotype on it. A walk shaded along a ramp publishes none, as its colour
// says where on the walk, not which walk.
export function haplotypeColorsOf(
  walks: readonly {
    name: string
    members?: readonly string[]
    encoding: WalkEncoding
  }[],
) {
  return walks.flatMap(({ name, members = [name], encoding }) => {
    const [only, ...ramp] = encodingStops(encoding)
    return only && ramp.length === 0
      ? members.map(member => {
          const { sample, haplotype } = parsePanSN(pathOrigin(member).name)
          return haplotype === undefined
            ? { sample, color: only.color }
            : { sample, haplotype, color: only.color }
        })
      : []
  })
}
