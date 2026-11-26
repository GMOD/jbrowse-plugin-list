import { abridgedWalks } from '@gmod/gfa-tabix'
import { walkRowRuns } from '@jbrowse/bandage-core/layout/walkRowRuns'

import type { AbridgedWalk } from '@gmod/gfa-tabix'
import type { GraphTables } from '@jbrowse/bandage-core/gfa/graphTables'
import type { WalkRunsTables } from '@jbrowse/bandage-core/gfa/walkRuns'
import type { WalkRowRuns } from '@jbrowse/bandage-core/layout/walkRowRuns'

/**
 * A cut: the tables, the walks it abridged, and for walk rows the rows' runs
 * over the window, which the main thread draws without a Graph of the walks'
 * steps
 */
export type WalkCut = GraphTables & {
  walkRowRuns?: WalkRowRuns
  abridged?: AbridgedWalk[]
}

/**
 * A window's walks as runs, for a fold to threads: no step decoded and no
 * node made but the reference's
 */
export interface RunsCut {
  runs: WalkRunsTables
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
