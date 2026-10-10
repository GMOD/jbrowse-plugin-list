import {
  backboneNodes,
  backbonePositions,
  overlapsWindow,
} from '@jbrowse/bandage-core/anchoredNodes'
import { ROW_HEIGHT_PX } from '@jbrowse/bandage-core/layout/rowSpacing'
import { walkRowsExtent } from '@jbrowse/bandage-core/layout/walkRowLayout'
import { loadGraph } from '@jbrowse/bandage-core/pipeline'

import type { WalkCut } from '../RgfaTabixAdapter/walkRowRuns.ts'
import type { GraphTables } from '@jbrowse/bandage-core/gfa/graphTables'
import type { WalkRows } from '@jbrowse/bandage-core/layout/walkRows'
import type { Graph, LayoutResult } from '@jbrowse/bandage-core/types'

/**
 * The Graph a walk-rows cut parses to: nodes with their depth over every
 * walk, links, and the reference walk, with every other walk named and
 * stepless. The rows come from the cut's runs, so no object per step is
 * built for them; a layout that draws nodes parses the cut whole.
 */
export function walkRowsGraph(
  cut: WalkCut,
  name: string,
  referencePath: string | undefined,
): Graph {
  const w = cut.walks
  const first = w.offsets[1] ?? 0
  const light: GraphTables = {
    nodes: cut.nodes,
    links: cut.links,
    walks: {
      names: w.names.slice(0, 1),
      starts: w.starts.subarray(0, 1),
      ends: w.ends.subarray(0, 1),
      offsets: Int32Array.of(0, first),
      steps: w.steps.subarray(0, first),
      reversed: w.reversed.subarray(0, first),
    },
  }
  const graph = loadGraph(light, name, { referencePath })
  const depth = new Int32Array(cut.nodes.names.length)
  for (const node of w.steps) {
    depth[node]!++
  }
  graph.nodes.forEach((node, i) => {
    node.depth = Math.max(depth[i]!, 1)
  })
  const stubs = w.names.slice(1).flatMap((walk, i) => {
    if (w.offsets[i + 2]! <= w.offsets[i + 1]!) {
      return []
    }
    const [sample = '', haplotype = '', ...contig] = walk.split('#')
    return [
      {
        name: `${sample}#${+haplotype}#${contig.join('#')}`,
        nodeIds: [],
        start: w.starts[i + 1]!,
        sample,
        haplotype: +haplotype,
        contig: contig.join('#'),
      },
    ]
  })
  graph.paths = [...(graph.paths ?? []), ...stubs]
  return graph
}

/** bandage-core's walkRowLayout, over rows already made */
export function walkRowLayoutOf(
  graph: Graph,
  walks: WalkRows,
  region?: { start: number; end: number },
): LayoutResult | undefined {
  const backbone = backboneNodes(graph)
  if (backbone.length === 0) {
    return undefined
  }
  const overWindow = region
    ? backbone.filter(n => overlapsWindow(n, region))
    : backbone
  return {
    nodePositions: backbonePositions(
      overWindow.length > 0 ? overWindow : backbone,
    ),
    rowLabels: [walks.reference, ...walks.rows].map((row, i) => ({
      label: row.label,
      y: i * ROW_HEIGHT_PX,
    })),
    referenceAxis: true,
    pixelRows: true,
    extent: walkRowsExtent(walks),
  }
}
