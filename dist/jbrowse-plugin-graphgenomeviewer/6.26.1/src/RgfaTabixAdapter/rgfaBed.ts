// A segment as it appears in segs.bed.gz, and as it is repeated inside every
// links.bed.gz row: `stableName start end segmentId rank [tags]`. The first
// five are the SN/SO/SR tags rGFA already carries, projected to BED by
// `gfatools gfa2bed -m`.
//
// `tags` is a space-separated list of GFA tags, written verbatim onto the
// S-line formatSegment synthesizes, where the GFA parser reads them into
// `GraphNode.tags` with no work here. It is the extension point for everything
// the five columns cannot say: carriage on a path-derived graph (`SM:Z:`), the
// collapse summary on a level-of-detail tier (`ct:Z:`, `cn:i:`, ...), a
// precomputed layout position later. rGFA files have no sixth column at all,
// so this is empty for them and nothing changes.
export interface RgfaSegment {
  refName: string
  start: number
  end: number
  id: string
  rank: number
  tags: string
}

export interface RgfaLink {
  source: string
  sourceStrand: string
  target: string
  targetStrand: string
  sourceSegment: RgfaSegment
  targetSegment: RgfaSegment
}

export function parseSegmentLine(line: string): RgfaSegment {
  return parseSegmentRow(line).segment
}

// gfa-to-tabix's anchored layout files a segment under the reference interval
// its bubble hangs from and states the segment's own coordinate after the rank:
// `anchorName anchorStart anchorEnd segmentId rank stableName start end [tags]`.
// One query over a region then returns every segment of every bubble under it,
// and `anchored` tells a cut it has nothing left to follow.
export function parseSegmentRow(line: string) {
  const cols = line.split('\t')
  const anchored = cols.length >= 8
  const own = anchored ? 5 : 0
  return {
    anchored,
    segment: {
      refName: cols[own]!,
      start: +cols[own + 1]!,
      end: +cols[own + 2]!,
      id: cols[3]!,
      rank: +cols[4]!,
      tags: cols[anchored ? 8 : 5] ?? '',
    } satisfies RgfaSegment,
  }
}

// Carriage as an ordinary feature attribute, for the linear track rather than
// the graph. The tag column reaches the graph view through the synthesized
// S-line (formatSegment below, then gfaConverter reads SM into
// `GraphNode.samples`), and that route ends at the graph: `getFeatures` builds
// its own features and had no way to say who carries a segment, so a lane
// colored by carriage was not expressible.
//
// `SM:Z:` is its own grammar check here. build_pggb_tabix.sh wrote a bare
// comma-separated list in this column before the tag column existed, and those
// files are still hosted; a bare list has no prefix to match, so it is dropped
// rather than read as one sample named `K12,Sakai,CFT073`.
//
// Undefined rather than [] when the tag is absent, matching gfaConverter: an
// rGFA has no sixth column at all, so a segment that says nothing about
// carriage stays distinguishable from one carried by nobody.
export function segmentSamples(segment: RgfaSegment) {
  const tag = segment.tags.split(' ').find(t => t.startsWith('SM:Z:'))
  if (tag === undefined) {
    return undefined
  }
  const samples = tag
    .slice('SM:Z:'.length)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  return samples.length > 0 ? samples : undefined
}

// `s322+` — the L-line's segment id with its orientation appended, mirroring
// the GFA record it came from.
function parseEndpoint(field: string) {
  return { id: field.slice(0, -1), strand: field.slice(-1) }
}

export function parseLinkLine(line: string): RgfaLink {
  const cols = line.split('\t')
  const source = parseEndpoint(cols[3]!)
  const target = parseEndpoint(cols[4]!)
  return {
    source: source.id,
    sourceStrand: source.strand,
    target: target.id,
    targetStrand: target.strand,
    sourceSegment: {
      id: source.id,
      refName: cols[5]!,
      start: +cols[6]!,
      end: +cols[7]!,
      rank: +cols[8]!,
      tags: cols[13] ?? '',
    },
    targetSegment: {
      id: target.id,
      refName: cols[9]!,
      start: +cols[10]!,
      end: +cols[11]!,
      rank: +cols[12]!,
      tags: cols[14] ?? '',
    },
  }
}

export function linkKey(link: RgfaLink) {
  return `${link.source}${link.sourceStrand}${link.target}${link.targetStrand}`
}

// The cut an anchored index gives: `under` is what the segment file returned
// for the window, every segment of every bubble under it, and `found` is what
// the link file returned. gfa-to-tabix files a link widely enough that `found`
// holds every link touching a segment in `under` and every link between the
// segments those lead to, plus links of neither kind, which are dropped here.
// A backbone link that jumps the whole window, as a deletion or inversion
// spanning it does, touches nothing in `under` and is kept by its own rule.
export function anchoredCut(
  under: Map<string, RgfaSegment>,
  found: RgfaLink[],
  window: StableSpan,
) {
  const side = (segment: RgfaSegment) =>
    segment.rank !== 0 || segment.refName !== window.refName
      ? 0
      : segment.end <= window.start
        ? -1
        : segment.start >= window.end
          ? 1
          : 0
  const segments = new Map(under)
  const links = new Map<string, RgfaLink>()
  for (const link of found) {
    if (
      under.has(link.source) ||
      under.has(link.target) ||
      side(link.sourceSegment) * side(link.targetSegment) === -1
    ) {
      links.set(linkKey(link), link)
      for (const segment of [link.sourceSegment, link.targetSegment]) {
        if (!segments.has(segment.id)) {
          segments.set(segment.id, segment)
        }
      }
    }
  }
  for (const link of found) {
    if (segments.has(link.source) && segments.has(link.target)) {
      links.set(linkKey(link), link)
    }
  }
  return { segments, links }
}

// Both endpoints of a link are written into every row, so the same link is
// indexed under each endpoint's stable sequence and arrives twice for a region
// covering both. Callers dedupe on linkKey.

export interface StableSpan {
  refName: string
  start: number
  end: number
}

// Where a cut reads links once more to close itself. A hop reads the links of
// the segments the round before it reached, so a link between two segments of
// the last round is never read and an allele reached from both ends draws as
// two stubs. rGFA lays an allele out as one stretch of the stable sequence that
// introduced it, so pieces of one sequence within the window's length of each
// other merge into a span, and reading it brings the pieces between too.
// Backbone reached past the window is unread for the same reason; its spans
// join only abutting pieces, since the reference past the window is not the
// cut's to fill. A span whose segments were all read and abut is skipped.
export function closingSpans(
  held: RgfaSegment[],
  unread: Set<string>,
  window: StableSpan,
) {
  const outside = (segment: RgfaSegment) =>
    segment.refName !== window.refName ||
    segment.end <= window.start ||
    segment.start >= window.end
  return [
    ...mergedSpans(
      held.filter(segment => segment.rank > 0),
      unread,
      window.end - window.start,
    ),
    ...mergedSpans(
      held.filter(segment => segment.rank === 0 && outside(segment)),
      new Set(held.map(segment => segment.id)),
      0,
    ),
  ]
}

function mergedSpans(
  segments: RgfaSegment[],
  unread: Set<string>,
  maxGap: number,
) {
  const sorted = [...segments].sort(
    (a, b) => compare(a.refName, b.refName) || a.start - b.start,
  )
  const spans: (StableSpan & { needed: boolean })[] = []
  for (const segment of sorted) {
    const span = spans.at(-1)
    if (
      span?.refName === segment.refName &&
      segment.start - span.end <= maxGap
    ) {
      span.needed ||= segment.start > span.end || unread.has(segment.id)
      span.end = Math.max(span.end, segment.end)
    } else {
      spans.push({
        refName: segment.refName,
        start: segment.start,
        end: segment.end,
        needed: unread.has(segment.id),
      })
    }
  }
  return spans
    .filter(span => span.needed)
    .map(({ refName, start, end }): StableSpan => ({ refName, start, end }))
}

// The links a closing read keeps: each end is a segment the cut holds or one
// lying inside a span. Following anything else is what another hop is for.
export function closingLinks(
  found: RgfaLink[],
  held: Map<string, RgfaSegment>,
  spans: StableSpan[],
) {
  const inside = (segment: RgfaSegment) =>
    held.has(segment.id) ||
    spans.some(
      span =>
        span.refName === segment.refName &&
        segment.start >= span.start &&
        segment.end <= span.end,
    )
  return found.filter(
    link => inside(link.sourceSegment) && inside(link.targetSegment),
  )
}

// Segments carry no sequence here — the BED records only their span — so every
// S-line is written with `*` and an LN tag, which is what the GFA spec asks for
// and what packages/graph-core's parser reads back as the node length.
// `NM:i:0`, `SM:Z:HG002.1,HG002.2` — the GFA tag grammar, checked rather than
// trusted. Files built before the tag column existed put a bare comma-separated
// sample list here, and passing that through would put a field that is not a
// tag on an S-line, which is a malformed GFA rather than a missing annotation.
// Dropping it degrades to the pre-tag behaviour instead.
const GFA_TAG = /^[A-Za-z][A-Za-z0-9]:[AifZJHB]:/

function formatSegment(segment: RgfaSegment) {
  const { id, refName, start, end, rank, tags } = segment
  const valid = tags.split(' ').filter(t => GFA_TAG.test(t))
  const extra = valid.length === 0 ? '' : `\t${valid.join('\t')}`
  return `S\t${id}\t*\tLN:i:${end - start}\tSN:Z:${refName}\tSO:i:${start}\tSR:i:${rank}${extra}`
}

function formatLink(link: RgfaLink) {
  const { source, sourceStrand, target, targetStrand } = link
  return `L\t${source}\t${sourceStrand}\t${target}\t${targetStrand}\t0M`
}

// Codepoint order, not localeCompare: the byte-identical-output guarantee below
// has to hold across locales.
function compare(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0
}

// Deterministic ordering: the same region always produces byte-identical GFA,
// so a layout computed from it is reproducible.
export function formatSubgraph(
  segments: Map<string, RgfaSegment>,
  links: Map<string, RgfaLink>,
) {
  const sortedSegments = [...segments.values()].sort(
    (a, b) =>
      compare(a.refName, b.refName) || a.start - b.start || compare(a.id, b.id),
  )
  const sortedLinks = [...links.keys()].sort((a, b) => compare(a, b))
  return [
    'H\tVN:Z:1.0',
    ...sortedSegments.map(s => formatSegment(s)),
    ...sortedLinks.map(k => formatLink(links.get(k)!)),
  ].join('\n')
}
