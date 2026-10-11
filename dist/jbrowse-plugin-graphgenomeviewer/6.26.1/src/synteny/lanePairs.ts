import type { ComparativeOptions } from '@jbrowse/synteny-core'

/**
 * Two lanes aligned to each other inside an anchor window: records on the
 * query lane's contigs, with the target lane's walk as the mate
 */
export interface LanePair {
  queryAssemblyName: string
  targetAssemblyName: string
}

/**
 * `haplotypes` narrows a fetch to the lanes listed: PanSN prefixes at sample
 * (`HG002`) or haplotype (`HG002#1`) depth, or assembly names the config maps
 * to one; undefined is every haplotype.
 *
 * `queryAssemblyName` with `targetAssemblyName`, on a window of the anchor,
 * asks for that pair of lanes aligned to each other inside the window.
 */
export interface LaneFeatureOptions extends ComparativeOptions {
  haplotypes?: string[]
  queryAssemblyName?: string
  lanePairs?: LanePair[]
}

export class PairTargetError extends Error {
  override name = 'PairTargetError'

  constructor(queryAssemblyName: string) {
    super(
      `a pair query names both lanes: queryAssemblyName ${queryAssemblyName} came without a targetAssemblyName`,
    )
  }
}

// The pairs a fetch asks for: its batch, else its one pair, else none
export function requestedPairs(opts: LaneFeatureOptions): LanePair[] {
  const { lanePairs, queryAssemblyName, targetAssemblyName } = opts
  if (lanePairs?.length) {
    return lanePairs
  } else if (queryAssemblyName === undefined) {
    return []
  } else if (targetAssemblyName === undefined) {
    throw new PairTargetError(queryAssemblyName)
  } else {
    return [{ queryAssemblyName, targetAssemblyName }]
  }
}
