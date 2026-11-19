import { walkRowRuns } from '@jbrowse/bandage-core/layout/walkRowRuns'
import { abridgedWalks } from '@jbrowse/graph-walks'

import type { GraphTables } from '@jbrowse/bandage-core/gfa/graphTables'
import type { WalkRowRuns } from '@jbrowse/bandage-core/layout/walkRowRuns'
import type { AbridgedWalk } from '@jbrowse/graph-walks'

/**
 * A cut: the tables, the walks it abridged, and for walk rows the rows' runs
 * over the window, which the main thread draws without a Graph of the walks'
 * steps
 */
export type WalkCut = GraphTables & {
  walkRowRuns?: WalkRowRuns
  abridged?: AbridgedWalk[]
}

export function walkCutFor(
  tables: GraphTables,
  region: { start: number; end: number },
  walkRows: boolean | undefined,
): WalkCut {
  const abridged = abridgedWalks(tables)
  return walkRows
    ? { ...tables, abridged, walkRowRuns: walkRowRuns(tables, region) }
    : { ...tables, abridged }
}
