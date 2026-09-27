import { stableCoordinate } from '../../gfa-core/index'
import { pathOrigin, surveyPaths } from '../pathAnchoring'

import type { GFAGraph, GFANode } from '../../gfa-core/index'
import type { PathSteps } from '../pathAnchoring'
import type { Graph, GraphEdge, GraphNode, GraphPath } from '../types'

// Single pass over every reference a GFA makes to a segment, collecting the two
// things the drawn graph needs from them.
//
// `canonical` is the one orientation each segment is drawn in, which is what
// Bandage calls single-node mode. A segment is the same sequence read either
// way (`L 1 + 2 +` is the same edge as `L 2 - 1 -`), so `1+` and `1-` are one
// node, not two: drawing both doubles every segment, and since the L lines only
// wire one of the pair, the other copy has no edges at all and scatters loose
// across the layout. Links carry the topology, so their orientation wins; a
// segment only paths mention takes the orientation they walk it in.
//
// `traversals` is how many paths cross each segment. Assembly GFAs carry read
// depth in a dp/RC/FC/KC tag, but a pangenome GFA (odgi, vg) carries none —
// there the meaningful depth is how many samples go through the segment, i.e.
// core versus accessory sequence.
function surveySegments(gfaGraph: GFAGraph) {
  const canonical = new Map<string, '+' | '-'>()
  const traversals = new Map<string, number>()
  function claim(id: string, strand: '+' | '-') {
    if (!canonical.has(id)) {
      canonical.set(id, strand)
    }
  }
  function traverse(id: string, strand: '+' | '-') {
    claim(id, strand)
    traversals.set(id, (traversals.get(id) ?? 0) + 1)
  }
  for (const link of gfaGraph.links) {
    claim(link.source, link.strand1 === '-' ? '-' : '+')
    claim(link.target, link.strand2 === '-' ? '-' : '+')
  }
  for (const gfaPath of gfaGraph.paths) {
    for (const segment of gfaPath.path.split(',')) {
      traverse(segment.slice(0, -1), segment.endsWith('-') ? '-' : '+')
    }
  }
  for (const walk of gfaGraph.walks) {
    for (const seg of walk.segments) {
      traverse(seg.id, seg.strand === '-' ? '-' : '+')
    }
  }
  return { canonical, traversals }
}

// P and W state the same thing in different shapes: a P body is a comma-joined
// `<id><strand>` list whose start offset lives in the record's *name*, a W
// record arrives already split into steps and states its start as a field.
// Normalized here so the coordinate walk sees one kind of path.
function anchorablePaths(gfaGraph: GFAGraph): PathSteps[] {
  return [
    ...gfaGraph.paths.map(p => ({
      ...pathOrigin(p.name),
      steps: p.path.split(',').map(segment => ({
        id: segment.slice(0, -1),
        strand: segment.endsWith('-') ? ('-' as const) : ('+' as const),
      })),
    })),
    ...gfaGraph.walks.map(w => ({
      name: `${w.sample}#${w.haplotype}#${w.contig}`,
      // `*` parses to -1, meaning the record declines to say; 0 is then the
      // only offset that can be assumed, and it makes the walk self-relative
      // rather than wrong
      start: w.start === -1 ? 0 : w.start,
      steps: w.segments.map(s => ({
        id: s.id,
        strand: s.strand === '-' ? ('-' as const) : ('+' as const),
      })),
    })),
  ]
}

// Carriage stated as a tag rather than derived from a walk. `RgfaTabixAdapter`
// synthesizes its S-lines from a segs.bed whose sixth column is a list of GFA
// tags, and `scripts/pggb_gfa_to_bed.py` in jbrowse-components puts every
// haplotype that visits a segment there as `SM:Z:K12.1,Sakai.1`. That is the
// only way carriage reaches an INDEXED graph: the cut has no P or W lines to
// walk, so `pathAnchoring` has no visits to derive it from.
//
// It does not compete with that walk. `pathAnchoring.anchorNode` rebuilds
// `samples` from the visits whenever there are any, so a graph loaded as a file
// keeps the authoritative path-derived set and this is what a tabix cut falls
// back to.
function carriedSamples(gfaNode: GFANode) {
  const sm = gfaNode.tags.SM
  if (typeof sm !== 'string') {
    return undefined
  }
  const samples = sm
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  return samples.length > 0 ? samples : undefined
}

const positive = (v: unknown) =>
  typeof v === 'number' && v > 0 ? v : undefined

// The depth a segment states, or undefined. DP is a depth in either case it is
// written. RC, FC and KC are read, fragment and k-mer counts, so depth is the
// count over the length: taken raw, a 100 kb node at 5x outweighed a 1 kb node
// at 50x tenfold in every width drawn from it.
function statedDepth({ tags, length }: GFANode) {
  const count = positive(tags.RC) ?? positive(tags.FC) ?? positive(tags.KC)
  return (
    positive(tags.dp) ??
    positive(tags.DP) ??
    (count !== undefined && length > 0 ? count / length : undefined)
  )
}

function makeNode(
  gfaNode: GFANode,
  strand: '+' | '-',
  depth: number,
): GraphNode {
  return {
    id: `${gfaNode.id}${strand}`,
    name: gfaNode.id,
    length: gfaNode.length,
    depth,
    stable: stableCoordinate(gfaNode),
    samples: carriedSamples(gfaNode),
  }
}

export function convertGFAToGraph(gfaGraph: GFAGraph, name = 'Imported GFA') {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  const { canonical, traversals } = surveySegments(gfaGraph)
  // segments no link, path, or walk mentions are drawn forward-strand
  const nodeId = (segmentId: string) =>
    `${segmentId}${canonical.get(segmentId) ?? '+'}`

  for (const gfaNode of gfaGraph.nodes) {
    const depth =
      statedDepth(gfaNode) ?? Math.max(traversals.get(gfaNode.id) ?? 1, 1)
    nodes.push(makeNode(gfaNode, canonical.get(gfaNode.id) ?? '+', depth))
  }

  for (const link of gfaGraph.links) {
    edges.push({
      from: nodeId(link.source),
      to: nodeId(link.target),
      fromStrand: link.strand1 === '-' ? '-' : '+',
      toStrand: link.strand2 === '-' ? '-' : '+',
    })
  }

  const paths: GraphPath[] = []
  const edgeToPathsMap = new Map<string, Set<string>>()

  // A path that walks the graph on the reverse strand visits an edge's nodes in
  // the opposite order to the L line that declared it, so the key is unordered.
  const edgeKey = (a: string, b: string) => [a, b].sort().join('--')

  function recordPathEdges(nodeIds: string[], name: string) {
    for (let i = 0; i < nodeIds.length - 1; i++) {
      const key = edgeKey(nodeIds[i]!, nodeIds[i + 1]!)
      if (!edgeToPathsMap.has(key)) {
        edgeToPathsMap.set(key, new Set())
      }
      edgeToPathsMap.get(key)!.add(name)
    }
  }

  for (const gfaPath of gfaGraph.paths) {
    // path segments arrive as `<id><strand>`; the node they land on is the
    // segment's canonical orientation, whichever way this path reads it
    const nodeIds = gfaPath.path
      .split(',')
      .map(segment => nodeId(segment.slice(0, -1)))
    paths.push({ name: gfaPath.name, nodeIds } satisfies GraphPath)
    recordPathEdges(nodeIds, gfaPath.name)
  }

  for (const walk of gfaGraph.walks) {
    const nodeIds = walk.segments.map(seg => nodeId(seg.id))
    // The full PanSN name, contig included, which is also what `anchorablePaths`
    // above calls the same record. Dropping the contig made a path's name an
    // ASSEMBLY's name, and one assembly walks one W record per contig: two walks
    // of `HG00438#1` then shared an identity, so `edgeToPathsMap` merged them,
    // `pathColors` (keyed by name) kept only the last colour written while the
    // node stripes kept the first, and the key drew one haplotype twice in two
    // colours. That is the ordinary Minigraph-Cactus shape, not a corner case.
    //
    // The legend narrows it back: `labelTiers` tries sample, then sample and
    // haplotype, then the whole name, so a graph with one contig per haplotype
    // is labelled exactly as before and only a colliding one widens.
    const name = `${walk.sample}#${walk.haplotype}#${walk.contig}`
    paths.push({
      name,
      nodeIds,
      sample: walk.sample,
      haplotype: walk.haplotype,
      contig: walk.contig,
    } satisfies GraphPath)
    recordPathEdges(nodeIds, name)
  }

  for (const edge of edges) {
    const pathIds = edgeToPathsMap.get(edgeKey(edge.from, edge.to))
    if (pathIds && pathIds.size > 0) {
      edge.pathIds = [...pathIds]
    }
  }

  // Only walked when the file has paths to walk, so an rGFA — which has none at
  // all — pays nothing for it. `lengthOf` reads the segment table rather than
  // the nodes just built, because a path may name a segment no S line declared.
  const lengths = new Map(gfaGraph.nodes.map(n => [n.id, n.length]))
  const anchoring =
    gfaGraph.paths.length > 0 || gfaGraph.walks.length > 0
      ? surveyPaths(anchorablePaths(gfaGraph), id => lengths.get(id) ?? 0)
      : undefined

  return {
    name,
    nodes,
    edges,
    paths: paths.length > 0 ? paths : undefined,
    anchorPaths: anchoring?.anchorPaths,
    pathVisits: anchoring?.pathVisits,
    // rGFA's own tags win wherever they are present; pathAnchoring only ever
    // fills in for a graph that carries none.
    anchoredBy: nodes.some(n => n.stable) ? 'tags' : undefined,
  } satisfies Graph
}
