import { firstNodeAtOrAfter, isBackbone } from '../anchoredNodes'
import { polylineSlice } from '../layout/mergeRuns'
import { svgPath } from '../util/geometry'

import type { GeneModel } from './geneFeatures'
import type { AnchoredNode } from '../anchoredNodes'
import type { Graph, NodeSegment } from '../types'

// A gene drawn onto the graph: its exons as stretches of the backbone nodes
// that carry them, in layout units, and one point on the backbone to pin its
// name to. Only the backbone has coordinates, so an allele shows no exon even
// where a haplotype's own annotation would put one.
export interface GenePin {
  gene: GeneModel
  // an SVG path of the exon stretches, in layout units
  exons: string
  // where the name goes: the backbone point at the gene's midpoint, or the
  // nearest backbone point inside the gene where the midpoint is not in the cut
  at: NodeSegment
  // how much of the gene's span the cut's backbone covers, so a label can say
  // when a gene runs off the cut
  covered: number
}

// A backbone node names its sequence the way the graph does, `GRCh38#0#chr6`,
// and a gene the way the assembly does, `chr6`; the contig is the part they
// share.
function contig(name: string) {
  return name.split('#').at(-1)!
}

// The backbone of one contig in offset order, for finding the nodes a gene
// lies over without reading the rest. `reach` is the longest node: a node over
// a gene's start begins no further before it than that.
interface ContigBackbone {
  nodes: AnchoredNode[]
  reach: number
}

export function genePins(
  graph: Graph,
  genes: GeneModel[],
  positions: Record<string, NodeSegment[]>,
): GenePin[] {
  // Per contig and sorted once, so a gene reads the few nodes it lies over.
  // Every gene used to read every backbone node, splitting both names each
  // time, on each frame of a node drag: 199 ms for 100 genes over 15k nodes,
  // now 12.
  const byContig = new Map<string, ContigBackbone>()
  const contigOf = new Map<string, string>()
  for (const node of graph.nodes) {
    if (isBackbone(node) && positions[node.id]?.length) {
      const { refName } = node.stable
      const name =
        contigOf.get(refName) ??
        contigOf.set(refName, contig(refName)).get(refName)!
      const entry =
        byContig.get(name) ??
        byContig.set(name, { nodes: [], reach: 0 }).get(name)!
      entry.nodes.push(node)
      entry.reach = Math.max(entry.reach, node.length)
    }
  }
  for (const { nodes } of byContig.values()) {
    nodes.sort((a, b) => a.stable.start - b.stable.start)
  }
  const pins: GenePin[] = []
  for (const gene of genes) {
    const backbone = byContig.get(contig(gene.refName))
    if (!backbone) {
      continue
    }
    const parts: string[] = []
    let at: NodeSegment | undefined
    let atDistance = Infinity
    let covered = 0
    const mid = (gene.start + gene.end) / 2
    const { nodes, reach } = backbone
    for (
      let i = firstNodeAtOrAfter(nodes, gene.start - reach);
      i < nodes.length && nodes[i]!.stable.start < gene.end;
      i++
    ) {
      const node = nodes[i]!
      const nodeStart = node.stable.start
      const nodeEnd = nodeStart + node.length
      if (nodeEnd <= gene.start) {
        continue
      }
      const line = positions[node.id]!
      covered += Math.min(nodeEnd, gene.end) - Math.max(nodeStart, gene.start)
      for (const exon of gene.exons) {
        const a = Math.max(exon.start, nodeStart)
        const b = Math.min(exon.end, nodeEnd)
        if (b <= a) {
          continue
        }
        const stretch = polylineSlice(
          line,
          (a - nodeStart) / node.length,
          (b - nodeStart) / node.length,
        )
        if (stretch.length === 1) {
          stretch.push({ ...stretch[0]! })
        }
        parts.push(svgPath(stretch))
      }
      const pinBp = Math.min(Math.max(mid, nodeStart), nodeEnd)
      const distance = Math.abs(pinBp - mid)
      if (distance < atDistance) {
        atDistance = distance
        const [p] = polylineSlice(
          line,
          (pinBp - nodeStart) / node.length,
          (pinBp - nodeStart) / node.length,
        )
        at = p
      }
    }
    if (at) {
      pins.push({
        gene,
        exons: parts.join(''),
        at,
        covered: covered / (gene.end - gene.start),
      })
    }
  }
  return pins
}
