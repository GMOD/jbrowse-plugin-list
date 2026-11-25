import { MAX_CELLS } from './limits'

import type { AbstractSessionModel } from '@jbrowse/core/util'

/** the RPC needs assemblyName to resolve refNameAliases for the file */
export interface FetchRegion {
  assemblyName: string
  refName: string
  start: number
  end: number
}

/** one track's worth of rows, and the name they are grouped under */
export interface TviewSource {
  adapterConfig: Record<string, unknown>
  sample: string
  trackId: string
}

/**
 * One RPC per launch, however many files it draws from. The session id is
 * shared across the sources so the worker keeps one adapter cache for the view
 * rather than one per file.
 */
export async function fetchTviewPlan({
  session,
  sources,
  region,
  maxCells = MAX_CELLS,
  signal,
}: {
  session: AbstractSessionModel
  sources: TviewSource[]
  region: FetchRegion
  maxCells?: number
  signal?: AbortSignal
}) {
  const rpcSessionId = `tview-${sources.map(s => s.trackId).join(',')}`
  const assembly = session.assemblyManager.get(region.assemblyName)
  return session.rpcManager.call(rpcSessionId, 'TviewGetPlan', {
    sources: sources.map(s => ({
      adapterConfig: s.adapterConfig,
      sample: s.sample,
    })),
    assemblyName: region.assemblyName,
    sequenceRefName:
      assembly?.getSeqAdapterRefName(region.refName) ?? region.refName,
    region,
    maxCells,
    signal,
  })
}
