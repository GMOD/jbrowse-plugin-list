import {
  MAX_GRAPH_REGION_BP,
  formatSpanBp,
} from './GraphGenomeView/pane/paneBase'
import { coarseHandover } from './LinearGraphDisplay/model'
import { cutsByHaplotype } from './graphTrackConfig'

export function hasCoarseTier(adapter: Record<string, unknown>) {
  return (
    adapter.type === 'RgfaTabixAdapter' &&
    coarseHandover(adapter.coarse) !== undefined
  )
}

// What a graph track can draw, in the words a picker and a refusal share
export function graphTrackReach(adapter: Record<string, unknown>) {
  const zoom = hasCoarseTier(adapter)
    ? 'Any zoom: a coarse graph when zoomed out'
    : `Zoomed in: under ${formatSpanBp(MAX_GRAPH_REGION_BP)}`
  return cutsByHaplotype(adapter) ? `${zoom} · haplotype walks` : zoom
}
