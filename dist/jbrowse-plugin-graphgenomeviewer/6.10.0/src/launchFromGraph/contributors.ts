import { isAnchored } from '@jbrowse/bandage-core/anchoredNodes'
import {
  panSNContig,
  panSNHaplotype,
  panSNSample,
} from '@jbrowse/bandage-core/pansn'

import type { AnchoredNode } from '@jbrowse/bandage-core/anchoredNodes'
import type { Graph, GraphNode } from '@jbrowse/bandage-core/types'

export interface GraphLocation {
  // PanSN sample name off the node's own stable sequence. The assembly that
  // contributed the sequence, which is a *name*, not a resolved assembly — see
  // resolveContributors.
  sample: string
  // `sample#hap` where the stable name states a haplotype (HPRC release 2.1
  // names every node `NA20809#2#CM094351.1`), so a sample loaded as two
  // assemblies opens the right one; undefined where it states none
  haplotype: string | undefined
  refName: string
  start: number
  end: number
}

// Where a node's own sequence lives, in the coordinates of the assembly that
// contributed it. rGFA states this on every segment: SN names the stable
// sequence and SO the offset on it, so this is exact at every rank.
//
// It is the other question from nodeReferenceSpan, which asks where a node sits
// on the *reference* axis and can only approximate that off the backbone. A
// rank>0 node has an exact coordinate of its own; what it has no coordinate for
// is the reference.
export function nodeOwnLocation(node: GraphNode): GraphLocation | undefined {
  return isAnchored(node) ? anchoredNodeLocation(node) : undefined
}

function anchoredNodeLocation(node: AnchoredNode): GraphLocation {
  return {
    sample: panSNSample(node.stable.refName),
    haplotype: panSNHaplotype(node.stable.refName),
    refName: panSNContig(node.stable.refName),
    start: node.stable.start,
    end: node.stable.start + node.length,
  }
}

export interface Contributor extends GraphLocation {
  // lowest rank this assembly holds here: 0 means it is the reference backbone
  rank: number
  nodeCount: number
}

interface Span {
  start: number
  end: number
}

// The widest run of spans with no gap larger than `maxGap`, which is the locus
// this assembly contributes *here*. A bare union of every span would be wrong
// on a graph where a sample also contributes sequence from a distant
// duplication: the union then reads as a multi-megabase locus, and a linear view
// launched at it shows neither end.
function widestCluster(spans: Span[], maxGap: number) {
  const sorted = [...spans].sort((a, b) => a.start - b.start)
  let best: Span | undefined
  let current: Span | undefined
  for (const span of sorted) {
    current =
      current && span.start - current.end <= maxGap
        ? { start: current.start, end: Math.max(current.end, span.end) }
        : { start: span.start, end: span.end }
    if (!best || current.end - current.start > best.end - best.start) {
      best = current
    }
  }
  return best
}

interface Group {
  sample: string
  haplotype: string | undefined
  refName: string
  rank: number
  spans: Span[]
}

function groupKey(loc: GraphLocation) {
  return `${loc.haplotype ?? loc.sample}\u0000${loc.refName}`
}

// Every assembly with a segment in this graph, and the locus each one covers on
// its own coordinates.
//
// This is what makes a launch out of the graph possible at all: the graph names
// its contributors in the data (rGFA's SN tag), so a node, a row and the graph
// as a whole can each say which assembly they belong to without consulting an
// alignment.
//
// Ordered reference-first, then by name, so the row order matches
// sampleRowLayout's and neither reshuffles as the window moves.
export function contributingAssemblies(
  graph: Graph,
  { maxGap = Infinity }: { maxGap?: number } = {},
): Contributor[] {
  const groups = new Map<string, Group>()
  for (const node of graph.nodes) {
    if (isAnchored(node)) {
      const loc = anchoredNodeLocation(node)
      const key = groupKey(loc)
      const group = groups.get(key)
      if (group) {
        group.spans.push({ start: loc.start, end: loc.end })
        group.rank = Math.min(group.rank, node.stable.rank)
      } else {
        groups.set(key, {
          sample: loc.sample,
          haplotype: loc.haplotype,
          refName: loc.refName,
          rank: node.stable.rank,
          spans: [{ start: loc.start, end: loc.end }],
        })
      }
    }
  }

  // One entry per assembly (a haplotype where the names state one, else the
  // sample): an assembly contributing on several contigs is launched at the
  // contig it contributes most of, since a linear view opens on one region.
  const bySample = new Map<string, Contributor>()
  for (const group of groups.values()) {
    const span = widestCluster(group.spans, maxGap)
    if (span) {
      const candidate = {
        sample: group.sample,
        haplotype: group.haplotype,
        refName: group.refName,
        start: span.start,
        end: span.end,
        rank: group.rank,
        nodeCount: group.spans.length,
      }
      const key = group.haplotype ?? group.sample
      const existing = bySample.get(key)
      if (!existing || candidate.nodeCount > existing.nodeCount) {
        bySample.set(key, candidate)
      }
    }
  }

  // Reference first, then by name: the same order sampleRowLayout gives its
  // rows, so the menu lists the assemblies in the order they are stacked on
  // screen. Sorting by rank instead would order them by minigraph's build
  // order, which is not what the labels beside the drawing say.
  return [...bySample.values()].sort(
    (a, b) =>
      Number(a.rank !== 0) - Number(b.rank !== 0) ||
      a.sample.localeCompare(b.sample) ||
      (a.haplotype ?? '').localeCompare(b.haplotype ?? ''),
  )
}

// The assembly a location opens on: its haplotype's where the name states one
// and the session holds it, else its sample's. A session holding both
// haplotypes of a sample opens the right one; one holding a haplotype under
// the bare sample name still opens it.
export function resolveLocationAssembly(
  resolve: (sample: string) => string | undefined,
  loc: Pick<GraphLocation, 'sample' | 'haplotype'>,
) {
  const byHaplotype =
    loc.haplotype === undefined ? undefined : resolve(loc.haplotype)
  return byHaplotype ?? resolve(loc.sample)
}

// Contributors that name an assembly this session has loaded, which are the
// only ones a linear or synteny view can open on.
//
// The two cases this filters apart are both normal. An E. coli pangenome demo
// loads every strain as its own assembly, so every contributor resolves and the
// whole graph is navigable. An HPRC graph names hundreds of haplotypes that no
// session would ever load as assemblies, so only the reference resolves —
// there the reference projection (nodeReferenceSpan) is the way back to a
// coordinate, not this.
//
// `resolve` is a name lookup rather than a list of names, because a PanSN sample
// is the *graph's* spelling and need not be the assembly's. HPRC's graph writes
// `CHM13`, and the assembly holding that sequence is UCSC's `hs1`, with CHM13
// among its aliases; matching on names alone leaves that donor unopenable unless
// the reader renames their assembly after the graph. The resolved (canonical)
// name replaces the sample, so a launch opens the assembly the session knows.
export function resolveContributors(
  contributors: Contributor[],
  resolve: (sample: string) => string | undefined,
) {
  return contributors.flatMap(c => {
    const sample = resolveLocationAssembly(resolve, c)
    return sample === undefined ? [] : [{ ...c, sample }]
  })
}

// 1-based inclusive, which is what a locstring means. Unformatted digits: this
// is parsed, not read. locLabel is the one people read.
export function locString(loc: GraphLocation) {
  return `${loc.refName}:${loc.start + 1}-${loc.end}`
}

export function locLabel(loc: { refName: string; start: number; end: number }) {
  return `${loc.refName}:${(loc.start + 1).toLocaleString()}-${loc.end.toLocaleString()}`
}
