import type { Graph, GraphNode } from './types'

// How thick a node draws. Bandage widens a node by its depth, the square root
// of its depth against the graph's mean, so a contig every read covers is fat
// and a spurious one is a hair. In a pangenome cut depth is carriage, how many
// walks go through the node, and the same rule makes the reference thick and a
// private allele thin. One table drives the persisted enum and the dropdown,
// the way BUBBLE_SPREADS does.
export const NODE_WIDTHS = [
  {
    value: 'depth',
    label: 'By depth',
    description:
      'Thicker the more paths carry a node, on the square root of its depth against the mean. A graph with one depth everywhere draws uniform.',
  },
  {
    value: 'uniform',
    label: 'Uniform',
    description: 'Every node the same thickness.',
  },
] as const

export type NodeWidth = (typeof NODE_WIDTHS)[number]['value']

export const NODE_WIDTH_VALUES = NODE_WIDTHS.map(w => w.value)

const MIN_FACTOR = 0.3
const MAX_FACTOR = 3

// Length-weighted, as Bandage's mean depth is, so a cut's long reference nodes
// set the norm and the alleles read against it.
export function meanDepth(graph: Graph) {
  let weighted = 0
  let length = 0
  for (const node of graph.nodes) {
    weighted += node.depth * node.length
    length += node.length
  }
  return length > 0 ? weighted / length : 0
}

export function depthWidthFactor(node: GraphNode, mean: number) {
  if (!(mean > 0) || !(node.depth > 0)) {
    return 1
  }
  return Math.min(
    MAX_FACTOR,
    Math.max(MIN_FACTOR, Math.sqrt(node.depth / mean)),
  )
}

// How wide a node is drawn, in screen px. One function for the geometry and
// for the hit test, so the pointer finds a node exactly where its ink is.
export function nodeWidthPx(
  node: GraphNode,
  contigThickness: number,
  nodeWidth: NodeWidth,
  mean: number,
) {
  return (
    contigThickness * (nodeWidth === 'depth' ? depthWidthFactor(node, mean) : 1)
  )
}

export function maxNodeWidthPx(contigThickness: number, nodeWidth: NodeWidth) {
  return contigThickness * (nodeWidth === 'depth' ? MAX_FACTOR : 1)
}
