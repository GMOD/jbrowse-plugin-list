import { REFERENCE_RANK } from './anchoredNodes'
import { panSNSample } from '../pansn'

import type { Graph, GraphNode, PathOrigin, PathVisit } from './types'

// Reference coordinates for a GFA that tags none of its segments with one.
//
// rGFA writes the fact per segment (SN/SO/SR). A pggb / odgi / Minigraph-Cactus
// graph writes the same fact once per path and leaves the arithmetic to the
// reader: walking a path's steps in order, accumulating segment lengths,
// assigns every segment that path visits an interval on the path's own
// sequence. Same information, different encoding — so a general GFA is not a
// degraded rGFA, and the anchored layouts work on it once the walk is done.
//
// It carries one thing rGFA cannot: a segment's *carriage*, the set of
// assemblies that actually traverse it. rGFA's SR is build order, so there the
// most a segment can say is which assembly first contributed it.

// `odgi extract` names an extracted path for the interval it covers on its own
// sequence: `K12#1#chr:1004500-1004961`. That suffix is the only place a cut
// subgraph states where in the genome it sits, so it is split off here rather
// than carried around as part of the name — no assembly has a sequence called
// `K12#1#chr:1004500-1004961`, and PanSN parsing of it yields a contig no
// linear view can open.
//
// Anchored on the digits rather than on a trailing colon, because a stable name
// may legitimately contain one (the same hazard gfaParser's tag splitting has).
const RANGE_SUFFIX = /:(\d+)-\d+$/

export function pathOrigin(pathName: string) {
  const match = RANGE_SUFFIX.exec(pathName)
  return match
    ? { name: pathName.slice(0, match.index), start: +match[1]! }
    : { name: pathName, start: 0 }
}

export interface PathSteps {
  name: string
  start: number
  steps: { id: string; strand: '+' | '-' }[]
}

// The single walk. Every segment visit lands in `pathVisits` at the bp its own
// path reaches it at; `anchorPaths` is what the walk learned about the paths
// themselves, which is what a reference-path picker lists.
export function surveyPaths(
  paths: PathSteps[],
  lengthOf: (segmentId: string) => number,
) {
  const anchorPaths: PathOrigin[] = []
  const pathVisits = new Map<string, PathVisit[]>()
  for (const path of paths) {
    const sample = panSNSample(path.name)
    let pos = path.start
    for (const step of path.steps) {
      const visit = {
        path: path.name,
        sample,
        start: pos,
        strand: step.strand,
      }
      const existing = pathVisits.get(step.id)
      if (existing) {
        existing.push(visit)
      } else {
        pathVisits.set(step.id, [visit])
      }
      pos += lengthOf(step.id)
    }
    anchorPaths.push({
      name: path.name,
      sample,
      start: path.start,
      length: pos - path.start,
    })
  }
  return { anchorPaths, pathVisits }
}

// Which path x is drawn on. This is a choice, not a fact: a general GFA's path
// names are arbitrary and nothing in the file marks one of them as the
// reference, so a preference is matched against a path's PanSN sample name (the
// assembly a subgraph was cut against, which is how the launch path knows) and
// then against its full name. With no preference the first path in the file
// wins, which is where pggb and odgi leave the reference.
export function chooseReferencePath(
  anchorPaths: PathOrigin[],
  preferred: string | undefined,
) {
  const named = anchorPaths.find(
    p => p.sample === preferred || p.name === preferred,
  )
  return named ?? anchorPaths[0]
}

// Rank on a path-derived graph is the one distinction the paths support: on the
// reference path or off it. rGFA's higher ranks are minigraph's build order,
// which a path GFA has no equivalent of, so drawing more rows than this would
// be drawing structure the file does not state.
const OFF_REFERENCE_RANK = 1

// A segment the reference path visits sits on the backbone at the offset that
// visit reaches it. One it never visits is an alternate allele, placed on the
// coordinates of the first path that does carry it — the same asymmetry rGFA
// has, where a rank>0 segment's SO is an offset on the assembly that
// contributed the sequence rather than on the reference.
//
// **First visit wins** when a path reaches the same segment more than once, and
// collapsed repeats make that real rather than hypothetical: pggb folds the
// E. coli rRNA operons into shared segments, so every strain's path walks them
// twice (`odgi depth` reaches 10 over a five-strain graph at chr:4,167,000 and
// chr:3,942,000). A node draws as one tube at one x, so the alternative to
// picking a copy is one tube spanning both, claiming reference the segment does
// not occupy. The repeat stays visible as depth: such a node's traversal count
// is a multiple of the path count.
function anchorNode(
  node: GraphNode,
  visits: PathVisit[] | undefined,
  reference: string,
): GraphNode {
  let anchored = node
  if (visits && visits.length > 0) {
    const anchor = visits.find(v => v.path === reference) ?? visits[0]!
    anchored = {
      ...node,
      stable: {
        refName: anchor.path,
        start: anchor.start,
        rank: anchor.path === reference ? REFERENCE_RANK : OFF_REFERENCE_RANK,
        strand: anchor.strand,
      },
      samples: [...new Set(visits.map(v => v.sample))].sort(),
    }
  }
  return anchored
}

// Re-runnable against a different reference path at no parsing cost, which is
// what the picker needs: the walk is already recorded in `pathVisits`, and only
// which path counts as rank 0 changes.
export function anchorFromPaths(graph: Graph, preferred: string | undefined) {
  const { anchorPaths, pathVisits } = graph
  const reference =
    anchorPaths && pathVisits
      ? chooseReferencePath(anchorPaths, preferred)
      : undefined
  return reference && pathVisits
    ? ({
        ...graph,
        nodes: graph.nodes.map(node =>
          anchorNode(node, pathVisits.get(node.name), reference.name),
        ),
        anchoredBy: 'paths',
        referencePath: reference.name,
      } satisfies Graph)
    : graph
}

// rGFA states coordinates on every segment, so only a graph that states none
// has to derive them. A GFA with neither tags nor paths comes back untouched
// and falls through to the force layout, which is the honest answer for it.
export function anchorGraph(graph: Graph, preferred: string | undefined) {
  return graph.anchoredBy === 'tags' ? graph : anchorFromPaths(graph, preferred)
}
