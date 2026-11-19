import { rowsNeedingRoutes } from '@jbrowse/bandage-core/layout/walkRowLinks'

import { EXPAND_NAMED_MAX } from '../GetSubgraph'

import type { WalkRow } from '@jbrowse/bandage-core/layout/walkRows'
import type { Graph } from '@jbrowse/bandage-core/types'
import type { AbridgedWalk } from '@jbrowse/graph-walks'

// The walks a tube map fetches the nodes of: every one holding steps not
// fetched, while it shows few enough haplotypes to fetch them all
export function tubeMapWalksToLoad(
  graph: Graph | undefined,
  abridged: AbridgedWalk[],
) {
  const haplotypes = new Set(
    (graph?.paths ?? []).map(p => `${p.sample}#${p.haplotype}`),
  )
  return haplotypes.size <= EXPAND_NAMED_MAX
    ? abridged.map(walk => walk.name)
    : []
}

// Why a tube map's boxes stay "nodes not shown": it shows more haplotypes
// than it fetches the nodes of
export function tubeMapNote(
  graph: Graph | undefined,
  abridged: AbridgedWalk[],
) {
  return abridged.length > 0 && tubeMapWalksToLoad(graph, abridged).length === 0
    ? `Node-level detail is fetched for at most ${EXPAND_NAMED_MAX} haplotypes at a time. Choose ${EXPAND_NAMED_MAX} or fewer under Load in the track menu, or in Graph settings, to see it.`
    : undefined
}

// The walks of the rows that ribbons, shared blocks and the shared order
// leave out, while few enough to fetch whole as a short list of names is
export function routesToLoad(rows: WalkRow[]) {
  return rowsNeedingRoutes(rows) <= EXPAND_NAMED_MAX
    ? rows.filter(row => rowsNeedingRoutes([row]) > 0).map(row => row.name)
    : []
}

const rowsText = (n: number) => `${n} row${n === 1 ? '' : 's'}`

// What happens to those rows, in the walk-row key's words: fetched while few
// enough, else left out, and how to bring them in
export function routesNote(rows: WalkRow[]) {
  const n = rowsNeedingRoutes(rows)
  return n === 0
    ? undefined
    : n <= EXPAND_NAMED_MAX
      ? `Fetching node-level detail for ${rowsText(n)}`
      : `Leaves out ${rowsText(n)}: node-level detail is fetched for at most ${EXPAND_NAMED_MAX} at a time. Choose up to ${EXPAND_NAMED_MAX} samples under Samples to include them.`
}
