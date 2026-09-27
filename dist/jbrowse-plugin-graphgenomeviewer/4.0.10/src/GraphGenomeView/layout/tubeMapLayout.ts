import { layoutTubeMap } from '@gmod/tubemap-core'

import { isBackbone } from '../anchoredNodes'
import { pathOrigin } from '../pathAnchoring'
import { pathCssColor } from '../pathColors'
import {
  canonicalStrand,
  readColor,
  stepName,
  tubeMapReads,
} from '../tubeMap/reads'

import type { Graph, LayoutResult, NodeSegment } from '../types'
import type {
  InputNode,
  InputTrack,
  LayoutNode,
  TubeMapLayout,
} from '@gmod/tubemap-core'

// The sequenceTubeMap drawing of a graph's paths: every P or W line a tube,
// every node a box the tubes pass through, laid out by @gmod/tubemap-core. The
// canvas draws none of it; TubeMapOverlay draws the shapes, and nodePositions
// is each box's centreline, for the hit test, the fit and the labels.
//
// Two x axes. `own` is the tube map's: columns in node order, a node as wide as
// log2 of its length, which is the compact picture sequenceTubeMap draws.
// `reference` pins each column to the reference bp its backbone node covers,
// so the tubes line up with the linear view's other tracks; the overlay makes
// room for the curves between columns when it draws (tubeMapWarp.ts).

// A column of the tube map: the nodes at one `order`, the tube x they were
// drawn over, and under the reference axis the reference bp they stand for.
export interface TubeMapColumn {
  order: number
  x0: number
  x1: number
  bp0: number
  bp1: number
}

export interface TubeMapDrawing {
  layout: TubeMapLayout
  // tube y minus this is the drawing's y, so the drawing starts at 0
  yOffset: number
  // set on the reference axis, sorted by order
  columns?: TubeMapColumn[]
}

// Strand of every visit a path makes to a segment, in walk order, so the k-th
// time a path reaches a segment reads the k-th entry. Visits name a path
// without the range suffix `odgi extract` appends (pathOrigin).
function visitStrands(graph: Graph) {
  const strands = new Map<string, ('+' | '-')[]>()
  for (const [segment, visits] of graph.pathVisits ?? []) {
    for (const visit of visits) {
      const key = `${visit.path}\t${segment}`
      const list = strands.get(key)
      if (list) {
        list.push(visit.strand)
      } else {
        strands.set(key, [visit.strand])
      }
    }
  }
  return strands
}

// A tube map track per path, the reference first: the layout straightens
// track 0 and orders every other node around it. A step reads its node in
// reverse where the path walks the segment against the strand the node is
// drawn in.
export function tubeMapTracks(graph: Graph): InputTrack[] {
  const nodeById = new Map(graph.nodes.map(n => [n.id, n]))
  const strands = visitStrands(graph)
  const paths = (graph.paths ?? []).map((path, index) => ({ path, index }))
  const reference = paths.findIndex(
    p => pathOrigin(p.path.name).name === graph.referencePath,
  )
  if (reference > 0) {
    paths.unshift(...paths.splice(reference, 1))
  }
  return paths.flatMap(({ path, index }) => {
    const visitName = pathOrigin(path.name).name
    const seen = new Map<string, number>()
    const sequence = path.nodeIds.flatMap(id => {
      const node = nodeById.get(id)
      if (!node) {
        return []
      }
      const k = seen.get(node.name) ?? 0
      seen.set(node.name, k + 1)
      const strand =
        strands.get(`${visitName}\t${node.name}`)?.[k] ?? canonicalStrand(node)
      return [stepName(node, strand)]
    })
    return sequence.length > 0
      ? [
          {
            id: index,
            name: path.name,
            sequence,
            sourceTrackID: 0,
            type: 'haplotype' as const,
          },
        ]
      : []
  })
}

function tubeMapNodes(graph: Graph): InputNode[] {
  return graph.nodes.map(n => ({
    name: n.id,
    seq: '',
    sequenceLength: Math.max(1, n.length),
  }))
}

export function hasTubeMapPaths(graph: Graph) {
  return (graph.paths?.length ?? 0) > 0
}

// Tubes narrow as paths are added, so ninety haplotypes stack about as tall as
// forty at full width rather than filling a screen and a half each.
const STACK_PX = 600
const MIN_TUBE_PX = 3
const MAX_TUBE_PX = 15

export function tubeWidth(trackCount: number) {
  return Math.max(
    MIN_TUBE_PX,
    Math.min(MAX_TUBE_PX, Math.floor(STACK_PX / Math.max(1, trackCount))),
  )
}

function runTubeMap(graph: Graph) {
  const paths = graph.paths ?? []
  const tracks = tubeMapTracks(graph)
  const reads = graph.reads
    ? tubeMapReads(graph, graph.reads, paths.length)
    : []
  return layoutTubeMap(tubeMapNodes(graph), tracks, reads, {
    nodeWidthOption: 'compressed',
    trackWidth: tubeWidth(tracks.length),
    trackColor: track =>
      track.type === 'read'
        ? readColor(track)
        : pathCssColor(track.id, paths.length),
  })
}

// Drawn nodes only: an unreached one has no x.
function drawnNodes(layout: TubeMapLayout) {
  const nodes: LayoutNode[] = []
  layout.nodes.forEach(node => {
    if (node.order >= 0) {
      nodes.push(node)
    }
  })
  return nodes
}

function centreline(node: LayoutNode, yOffset: number, x0: number, x1: number) {
  const y = node.y + node.contentHeight / 2 - yOffset
  return [
    { x: x0, y },
    { x: x1, y },
  ]
}

function extentOf(layout: TubeMapLayout, yOffset: number) {
  return {
    minY: layout.bounds.minY - yOffset,
    maxY: layout.bounds.maxY - yOffset,
  }
}

export function tubeMapLayout(graph: Graph): LayoutResult | undefined {
  const layout = hasTubeMapPaths(graph) ? runTubeMap(graph) : undefined
  if (!layout) {
    return undefined
  }
  const yOffset = layout.bounds.minY
  const nodePositions: Record<string, NodeSegment[]> = {}
  for (const node of drawnNodes(layout)) {
    nodePositions[node.name] = centreline(
      node,
      yOffset,
      node.x,
      node.x + node.pixelWidth,
    )
  }
  const { minY, maxY } = extentOf(layout, yOffset)
  return {
    nodePositions,
    tubeMap: { layout, yOffset },
    extent: {
      minX: layout.bounds.minX,
      maxX: layout.bounds.maxX,
      minY,
      maxY,
    },
  }
}

// Each column's reference bp: the span of its backbone nodes, whose merged
// length the layout summed, or a point where the previous column ended for a
// column of inserted sequence alone. Clamped to run left to right, so an
// inversion the reference walks backwards cannot fold the axis over.
function tubeMapColumns(graph: Graph, layout: TubeMapLayout): TubeMapColumn[] {
  const nodeById = new Map(graph.nodes.map(n => [n.id, n]))
  const byOrder = new Map<number, LayoutNode[]>()
  for (const node of drawnNodes(layout)) {
    const list = byOrder.get(node.order)
    if (list) {
      list.push(node)
    } else {
      byOrder.set(node.order, [node])
    }
  }
  const columns: TubeMapColumn[] = []
  let end = -Infinity
  for (const order of [...byOrder.keys()].sort((a, b) => a - b)) {
    const nodes = byOrder.get(order)!
    let bp0 = Infinity
    let bp1 = -Infinity
    for (const node of nodes) {
      const graphNode = nodeById.get(node.name)
      if (graphNode && isBackbone(graphNode)) {
        bp0 = Math.min(bp0, graphNode.stable.start)
        bp1 = Math.max(bp1, graphNode.stable.start + node.sequenceLength)
      }
    }
    if (bp0 === Infinity) {
      bp0 = bp1 = end
    }
    if (bp0 < end) {
      bp0 = end
      bp1 = Math.max(end, bp1)
    }
    end = Math.max(end, bp1)
    columns.push({
      order,
      x0: Math.min(...nodes.map(n => n.x)),
      x1: Math.max(...nodes.map(n => n.x + n.pixelWidth)),
      bp0,
      bp1,
    })
  }
  // columns before the first backbone node take its start
  const first = columns.find(c => c.bp0 !== -Infinity)
  for (const column of columns) {
    if (column.bp0 === -Infinity) {
      column.bp0 = column.bp1 = first?.bp0 ?? 0
    }
  }
  return columns
}

function pathsReachBackbone(graph: Graph) {
  return graph.nodes.some(isBackbone) && hasTubeMapPaths(graph)
}

export function tubeMapReferenceLayout(graph: Graph): LayoutResult | undefined {
  const layout = pathsReachBackbone(graph) ? runTubeMap(graph) : undefined
  if (!layout) {
    return undefined
  }
  const columns = tubeMapColumns(graph, layout)
  const byOrder = new Map(columns.map(c => [c.order, c]))
  const yOffset = layout.bounds.minY
  const nodePositions: Record<string, NodeSegment[]> = {}
  for (const node of drawnNodes(layout)) {
    const column = byOrder.get(node.order)!
    nodePositions[node.name] = centreline(node, yOffset, column.bp0, column.bp1)
  }
  return {
    nodePositions,
    tubeMap: { layout, yOffset, columns },
    referenceAxis: true,
    pixelRows: true,
    extent: extentOf(layout, yOffset),
  }
}
