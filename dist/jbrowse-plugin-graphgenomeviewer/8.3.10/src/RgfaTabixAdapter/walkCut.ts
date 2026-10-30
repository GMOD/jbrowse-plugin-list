import { walkRowRuns } from '@jbrowse/bandage-core/layout/walkRowRuns'

import type { GraphTables } from '@jbrowse/bandage-core/gfa/graphTables'
import type { WalkRowRuns } from '@jbrowse/bandage-core/layout/walkRowRuns'

/**
 * A cut for walk rows: the tables, and the rows' runs over the window, which
 * the main thread draws without a Graph of the walks' steps
 */
export type WalkCut = GraphTables & { walkRowRuns?: WalkRowRuns }

export function walkCutFor(
  tables: GraphTables,
  region: { start: number; end: number },
  walkRows: boolean | undefined,
): WalkCut {
  return walkRows
    ? { ...tables, walkRowRuns: walkRowRuns(tables, region) }
    : tables
}
