import {
  addLink,
  anchoredCut,
  closingLinks,
  closingSpans,
  formatSubgraph,
  parseLinkLine,
  parseSegmentRow,
} from './rgfaBed.ts'
import { getLines } from '../tabixRange.ts'

import type { RgfaLink, RgfaSegment, StableSpan } from './rgfaBed.ts'
import type { TabixIndexedFile } from '@gmod/tabix'

// What a hop follows: alleles, never the backbone. A rank-0 segment reached
// through a link is flanking backbone, usually outside the window, so querying
// its links walks the reference away from the region, brings back more backbone,
// and closes nothing. Every segment that closes a bubble is an allele interior,
// and an allele interior is rank > 0 in both index formats (rGFA's SR tag, and
// pggb's rank 0-or-1 against the anchor path). Reached backbone still becomes a
// node and its edge still draws; it is only not walked through.
//
// This is gfabase's rule, arrived at from the other end. `gfabase sub` expands
// from a seed either to the whole connected component (`--connected`, which its
// own README calls overkill) or with `--cutpoints 1`, which takes the biconnected
// component by *stopping at cutpoints*, the segments every end-to-end walk of
// the chromosome must traverse. In a reference-anchored pangenome the cutpoints
// are the backbone, and rank is what the index already states about it, so
// `rank > 0` is that stopping rule without a connectivity index to build. The
// third tool is the same shape again: `gfatools view -R` maps the region onto its
// precomputed bubble decomposition and returns whole overlapping bubbles
// (gfa_query_by_reg), which is complete for the same reason. Bandage's own
// `--distance` is a node-step radius, but Bandage holds the entire graph in
// memory, so its scope is a drawing filter rather than a fetch strategy.
//
// Measured with this rule: the E. coli paa window converges at one hop (17
// segments at 1 and at 2), so the cut closes and stays closed. HPRC's amylase
// window keeps growing (63 at 0, 78 at 1, 92 at 2) because its alleles have
// alleles, and wall-clock is flat across all three, since a hop's queries go out
// together and the remote index dominates.
//
// The exact version, when a graph ships a bubble index beside its segments:
// gfatools' bubble rows carry the member segment ids of every bubble, so the
// bubbles overlapping the region state which segments a complete cut must
// contain. That turns the hop count into a termination condition rather than a
// setting, and MinigraphBubbleAdapter already parses those rows.
function offReference(segments: RgfaSegment[]) {
  return segments.filter(segment => segment.rank > 0)
}

export interface RgfaFiles {
  segments: TabixIndexedFile
  links: TabixIndexedFile
}

async function linksOver(
  file: TabixIndexedFile,
  span: StableSpan,
  signal?: AbortSignal,
) {
  const found: RgfaLink[] = []
  await getLines(file, span.refName, span.start, span.end, {
    signal,
    lineCallback: line => {
      found.push(parseLinkLine(line))
    },
  })
  return found
}

/**
 * The graph around a window of one stable sequence, as GFA text. The window's
 * own segments come from the segment file; the link file supplies the edges
 * incident to them *and* the coordinates of the segments on the other end,
 * which typically sit on a different stable sequence (a rank>0 bubble) and so
 * are not reachable by any coordinate query on this window.
 *
 * `hops` is extra rounds of link-following past the window's own segments and
 * their immediate neighbours, each costing one tabix query per off-reference
 * segment newly reached. After the last round, one more read per stretch of
 * stable sequence the cut holds closes it (closingSpans), so an allele reached
 * from both ends draws whole. The view asks for one hop; a hopless cut stays
 * as cheap as it was. `signal` goes to every one of those queries, so a cut
 * the view has replaced stops.
 */
export async function rgfaCut(
  files: RgfaFiles,
  window: StableSpan,
  { hops = 0, signal }: { hops?: number; signal?: AbortSignal } = {},
) {
  const segments = new Map<string, RgfaSegment>()
  const links = new Map<string, RgfaLink>()
  const layout = { anchored: false }
  await getLines(files.segments, window.refName, window.start, window.end, {
    signal,
    lineCallback: line => {
      const row = parseSegmentRow(line)
      layout.anchored ||= row.anchored
      segments.set(row.segment.id, row.segment)
    },
  })
  // An anchored index files every allele and every link under the reference
  // interval its bubble hangs from, so one read of each file holds the whole
  // graph under the window and there is nothing to hop to or close.
  if (layout.anchored) {
    const cut = anchoredCut(
      segments,
      await linksOver(files.links, window, signal),
      window,
    )
    return formatSubgraph(cut.segments, cut.links)
  }
  const addLinksOver = async (span: StableSpan) =>
    (await linksOver(files.links, span, signal)).flatMap(link =>
      addLink(segments, links, link),
    )
  let frontier = offReference(await addLinksOver(window))
  for (let hop = 0; hop < hops; hop++) {
    // One hop's queries are independent of each other, so they go out
    // together rather than one round-trip at a time, and the output is sorted
    // at the end regardless of the order they arrive in.
    const reached = await Promise.all(frontier.map(addLinksOver))
    frontier = offReference(reached.flat())
  }
  if (hops > 0) {
    const spans = closingSpans(
      [...segments.values()],
      new Set(frontier.map(segment => segment.id)),
      window,
    )
    const found = await Promise.all(
      spans.map(span => linksOver(files.links, span, signal)),
    )
    for (const link of closingLinks(found.flat(), segments, spans)) {
      addLink(segments, links, link)
    }
  }
  return formatSubgraph(segments, links)
}
