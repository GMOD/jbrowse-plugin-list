import type { Graph } from '../types'

// The graph inside one bubble: the segments the bubble row names, with the
// links among them. The row's list includes the two backbone segments the
// bubble hangs between, so the cut keeps its anchors and every layout that
// needs a backbone still has one. A walk keeps the steps it takes inside the
// bubble, so the bubbles derived inside it still read their routes and
// lengths off the haplotypes, and carriage still sets node width.
export function bubbleSubgraph(graph: Graph, segmentIds: string[]): Graph {
  const keep = new Set(segmentIds)
  const nodes = graph.nodes.filter(n => keep.has(n.name))
  const ids = new Set(nodes.map(n => n.id))
  const paths = graph.paths
    ?.map(p => ({ ...p, nodeIds: p.nodeIds.filter(id => ids.has(id)) }))
    .filter(p => p.nodeIds.length > 0)
  return {
    name: graph.name,
    nodes,
    edges: graph.edges.filter(e => ids.has(e.from) && ids.has(e.to)),
    ...(paths?.length ? { paths } : {}),
    anchorPaths: graph.anchorPaths,
    pathVisits: graph.pathVisits,
    anchoredBy: graph.anchoredBy,
    referencePath: graph.referencePath,
  }
}
