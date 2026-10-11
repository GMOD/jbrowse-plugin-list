// What a drawing adds over its nodes and edges:
// - `paths`: a ribbon per walk
// - `bubbles`: a halo along each bubble's nodes, with a label that opens it.
//   Off by default, since on a base-level cut every SNP's halo is a blob
// - `deletions`: an edge for each walk that skips reference
// - `genes`: the session's genes, exons along the nodes that carry them
// - `referenceStrip`: reference segments at their bp, over a drawing in its
//   own coordinates inside a linear view
// - `walkStrip`: walk rows under a node layout, linked to the drawing
export type GraphLayer =
  'paths' | 'bubbles' | 'deletions' | 'genes' | 'referenceStrip' | 'walkStrip'

const DEFAULTS: Record<GraphLayer, boolean> = {
  paths: false,
  bubbles: false,
  deletions: true,
  genes: true,
  referenceStrip: true,
  walkStrip: false,
}

// A config or session states only what differs from the defaults, as
// `{ bubbles: true, genes: false }`, so a default a later release adds still
// reaches it
export type GraphLayers = Partial<Record<GraphLayer, boolean>>

export function layersOf(layers: unknown) {
  const stated = (
    typeof layers === 'object' && layers !== null ? layers : {}
  ) as GraphLayers
  return new Set(
    (Object.keys(DEFAULTS) as GraphLayer[]).filter(
      layer => stated[layer] ?? DEFAULTS[layer],
    ),
  )
}

export function withLayer(layers: unknown, layer: GraphLayer, on: boolean) {
  const { [layer]: _was, ...rest } = (
    typeof layers === 'object' && layers !== null ? layers : {}
  ) as GraphLayers
  return on === DEFAULTS[layer] ? rest : { ...rest, [layer]: on }
}
