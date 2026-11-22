import { isBackbone } from '@jbrowse/bandage-core/anchoredNodes'
import {
  buildNeighbors,
  nodeReferenceSpan,
} from '@jbrowse/bandage-core/referenceSpan'

import type { GenePin } from '@jbrowse/bandage-core/genes/genePins'
import type { Graph, NodeSegment } from '@jbrowse/bandage-core/types'

export interface ViewWindow {
  start: number
  end: number
}

export const NO_NODES: ReadonlySet<string> = new Set()

// An insertion's span is the one bp its flanks meet at, so the ends count
function touches(span: ViewWindow, window: ViewWindow) {
  return span.end >= window.start && span.start <= window.end
}

// The reference stays, so a link or a skip from inside the view still runs
// to its edge; a node whose flanks are out of reach stays too
export function nodesOutsideWindow(graph: Graph, window: ViewWindow) {
  const nodeById = new Map(graph.nodes.map(node => [node.id, node]))
  const neighbors = buildNeighbors(graph)
  return new Set(
    graph.nodes.flatMap(node => {
      const span = isBackbone(node)
        ? undefined
        : nodeReferenceSpan({ nodeId: node.id, nodeById, neighbors })
      return span && !touches(span, window) ? [node.id] : []
    }),
  )
}

// A reference segment past the view's edge was clipped to the cut, not the
// view, so its length counts sequence the view does not show
export function wholeInWindow(
  node: Graph['nodes'][number],
  outside: ReadonlySet<string>,
  window: ViewWindow,
) {
  return isBackbone(node)
    ? node.stable.start >= window.start &&
        node.stable.start + node.length <= window.end
    : !outside.has(node.id)
}

export function lengthsInWindow(
  lengths: Map<string, number>,
  graph: Graph,
  outside: ReadonlySet<string>,
  window: ViewWindow | undefined,
) {
  return window
    ? new Map(
        graph.nodes.flatMap(node => {
          const length = lengths.get(node.id)
          return length !== undefined && wholeInWindow(node, outside, window)
            ? [[node.id, length] as const]
            : []
        }),
      )
    : lengths
}

export function genesInWindow<T extends ViewWindow>(
  genes: readonly T[],
  window: ViewWindow | undefined,
) {
  return window ? genes.filter(gene => touches(gene, window)) : genes
}

export function ownPinsInWindow(
  pins: GenePin[],
  ownGenes: ReadonlySet<GenePin['gene']>,
  outside: ReadonlySet<string>,
) {
  return outside.size === 0
    ? pins
    : pins.filter(
        pin =>
          !ownGenes.has(pin.gene) ||
          [...pin.nodeIds].some(id => !outside.has(id)),
      )
}

type Positions = Record<string, NodeSegment[]>

// The edge curves a build reuses are cached against the positions object
const trimmed = new WeakMap<
  Positions,
  { outside: ReadonlySet<string>; version: number; positions: Positions }
>()

export function positionsWithout(
  positions: Positions,
  outside: ReadonlySet<string>,
  version: number,
) {
  const held = trimmed.get(positions)
  return outside.size === 0
    ? positions
    : held?.outside === outside && held.version === version
      ? held.positions
      : trim(positions, outside, version)
}

function trim(
  positions: Positions,
  outside: ReadonlySet<string>,
  version: number,
) {
  const kept = Object.fromEntries(
    Object.entries(positions).filter(([id]) => !outside.has(id)),
  )
  trimmed.set(positions, { outside, version, positions: kept })
  return kept
}
