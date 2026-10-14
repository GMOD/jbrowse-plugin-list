import type { SubgraphRegion } from '../GetSubgraph'
import type { HostWindow } from '../GraphGenomeView/host'

// Whether `seen` is near where a cut came back over its node limit. The graph
// is as dense as that only near it, so the refusal stands for windows as wide
// or wider on the same contig within one window-width of it.
export function denseCovers(
  dense: SubgraphRegion | undefined,
  seen: HostWindow,
) {
  if (
    dense?.refName !== seen.refName ||
    dense.assemblyName !== seen.assemblyName
  ) {
    return false
  }
  const span = dense.end - dense.start
  return (
    seen.end - seen.start >= span &&
    seen.end > dense.start - span &&
    seen.start < dense.end + span
  )
}
