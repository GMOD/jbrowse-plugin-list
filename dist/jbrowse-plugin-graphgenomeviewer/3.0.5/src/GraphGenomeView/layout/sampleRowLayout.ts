import { placeOffReference } from './placeOffReference'
import { ROW_HEIGHT_PX } from './rowSpacing'
import { parsePanSN } from '../../alleleProjection/projectAlleles'
import {
  backboneNodes,
  backbonePositions,
  isOffReference,
  referenceSpan,
} from '../anchoredNodes'

import type { Graph, LayoutResult, RowLabel } from '../types'

// One row per contributing assembly, x on the reference.
//
// The anchored layout rows by *rank*, which is a property of the graph's
// construction order rather than of any sample: at an HPRC locus rank 1 holds
// alleles from dozens of different haplotypes, so a row there means nothing
// biological. This layout rows by the assembly each allele came from, so a row
// is one sample and reading across it says what that sample does to the
// reference: a deletion leaves the row empty across the span it removes, and an
// insertion is a mark at the point it attaches. Insertion *size* is deliberately
// not on this axis — see placeOffReference.
//
// Positions come from `projectAlleles`, which derives them from the stable
// coordinates and the L-lines alone. rGFA has no W/P records to consult, so
// anything requiring walks could not run on the format the graph tracks read.
//
// What a row means differs with where the coordinates came from, and the
// difference is not cosmetic. On rGFA a segment's SN names the assembly that
// *first contributed* it (SR is build order), so a row is first-seen
// attribution. On a path-anchored graph it names an assembly that actually
// carries the segment. Carriage is a set, though, and a row here is one node's
// one position: where several assemblies carry a segment, it draws on the row
// of the first path in the file that visits it, and `GraphNode.samples` holds
// the rest. Drawing a segment once per carrier needs the layout to emit more
// nodes than the graph has, which the renderer keys by node id and cannot do.

// Every assembly with a segment in this subgraph, ordered by how much
// off-reference sequence it contributes here, most first. Taken from the nodes
// rather than from the projection's per-allele attribution: a bubble path can
// mix assemblies, and a segment belongs on the row of the assembly its own
// stable name gives it, not on the row of whichever contributor happens to
// dominate the run it sits in.
//
// Read off the same field `rowY` places by, so every row that exists has nodes
// on it and every node lands on a row that exists.
//
// **Sorted by content rather than by name**, which is the change and the
// tradeoff. Alphabetical put `HG00099` above `HG00280` for no reason a reader
// could see, so a row's neighbours said nothing and the stack had to be read one
// row at a time. By contributed sequence it reads the way a sorted pileup does:
// the haplotypes doing the most to the reference are together at the top, and
// how far down the stack the marks stop IS how many samples carry anything.
//
// What that costs is comparing one window against another — the order is a fact
// about the window, so a sample is not in the same place in two of them. That is
// the case §8's "a row set cannot be requested" is for, and an explicit sample
// list is the right answer to it rather than an order nobody can read.
//
// Name breaks ties, so the order is still deterministic and a pan that changes
// nothing about the content reshuffles nothing.
function contributingSamples(graph: Graph) {
  const carried = new Map<string, number>()
  for (const node of graph.nodes) {
    if (isOffReference(node)) {
      const { sample } = parsePanSN(node.stable.refName)
      carried.set(sample, (carried.get(sample) ?? 0) + node.length)
    }
  }
  return [...carried.keys()].sort(
    (a, b) => carried.get(b)! - carried.get(a)! || a.localeCompare(b),
  )
}

export function sampleRowLayout(
  graph: Graph,
  region?: { start: number; end: number },
): LayoutResult | undefined {
  const backbone = backboneNodes(graph)
  const samples = contributingSamples(graph)
  if (backbone.length === 0 || samples.length === 0) {
    return undefined
  }
  const span = referenceSpan(backbone, region)

  // The backbone keeps row 0 and every sample gets a row below it, in the
  // order contributingSamples gives.
  const rowOf = new Map(samples.map((s, i) => [s, i + 1]))
  const nodePositions = backbonePositions(backbone)

  // `placeOffReference` also reaches nodes with no coordinate at all: it walks
  // out from what it placed to close a run that leaves the fetched window, and
  // on a path-anchored graph a segment no P or W line visits never got a
  // `stable` to begin with. That is legal GFA rather than a broken file, so
  // asserting the coordinate here threw a bare "cannot read properties of
  // undefined" out of the layout and left the view showing it instead of a
  // graph. Such a node belongs on no sample's row, so it takes the spare row
  // below the named ones, which is what the sibling layout does with an
  // unrecognised rank.
  const spareRow = samples.length + 1
  const alleleDeletions = placeOffReference({
    graph,
    span,
    rowY: node => {
      const stable = node.stable
      const row = stable
        ? rowOf.get(parsePanSN(stable.refName).sample)
        : undefined
      return (row ?? spareRow) * ROW_HEIGHT_PX
    },
    positions: nodePositions,
  })

  // Built from the same `rowOf` map that placed the alleles, so a label cannot
  // name a row the layout put somewhere else. Row 0 is the backbone, named for
  // the assembly it comes from rather than "reference", because on this layout
  // that name is one of the samples and reads as a peer of the rows below it.
  const referenceSample = parsePanSN(backbone[0]!.stable.refName).sample
  const rowLabels: RowLabel[] = [
    { label: referenceSample, y: 0 },
    ...samples.map(sample => ({
      label: sample,
      y: rowOf.get(sample)! * ROW_HEIGHT_PX,
    })),
  ]

  return {
    nodePositions,
    rowLabels,
    referenceAxis: true,
    pixelRows: true,
    alleleDeletions,
  }
}
