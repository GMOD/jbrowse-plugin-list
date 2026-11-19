import { LABEL_DEFAULTS } from '@jbrowse/bandage-core/graphLabels'

import { isRecord } from '../isRecord'

// What a drawing adds over its nodes and edges:
// - `paths`: a ribbon per walk
// - `bubbles`: a halo along each bubble's nodes, with a label that opens it.
//   Off by default, since on a base-level cut every SNP's halo is a blob
// - `deletions`: an edge for each walk that skips reference
// - `genes`: the session's genes, exons along the nodes that carry them
// - `lengths`: each node's length written on it, where it fits
// - `referenceStrip`: reference segments at their bp, over a drawing in its
//   own coordinates inside a linear view
// - `walkStrip`: walk rows under a node layout, linked to the drawing
// - `walkRibbons`: between neighbouring walk rows, a ribbon joining the
//   stretches both walk through the same nodes
// - `walkBlocks`: on walk rows, a lettered box round each stretch of nodes off
//   the reference's path that two or more rows walk
// - `smallSites`: every node and skip at any zoom. Off by default, so a site
//   too small to see at the current zoom is left out, counted in the key,
//   and drawn again as a zoom reaches it
export type GraphLayer =
  | 'paths'
  | 'bubbles'
  | 'deletions'
  | 'genes'
  | 'lengths'
  | 'referenceStrip'
  | 'walkStrip'
  | 'walkRibbons'
  | 'walkBlocks'
  | 'smallSites'

const DEFAULTS: Record<GraphLayer, boolean> = {
  paths: false,
  bubbles: false,
  deletions: true,
  genes: true,
  lengths: LABEL_DEFAULTS.nodeLengths,
  referenceStrip: true,
  walkStrip: false,
  walkRibbons: false,
  walkBlocks: false,
  smallSites: false,
}

// A config or session states only what differs from the defaults, as
// `{ bubbles: true, genes: false }`, so a default a later release adds still
// reaches it
export type GraphLayers = Partial<Record<GraphLayer, boolean>>

export function layersOf(layers: unknown) {
  const stated = (isRecord(layers) ? layers : {}) as GraphLayers
  return new Set(
    (Object.keys(DEFAULTS) as GraphLayer[]).filter(
      layer => stated[layer] ?? DEFAULTS[layer],
    ),
  )
}

export function withLayer(layers: unknown, layer: GraphLayer, on: boolean) {
  const { [layer]: _was, ...rest } = (
    isRecord(layers) ? layers : {}
  ) as GraphLayers
  return on === DEFAULTS[layer] ? rest : { ...rest, [layer]: on }
}
