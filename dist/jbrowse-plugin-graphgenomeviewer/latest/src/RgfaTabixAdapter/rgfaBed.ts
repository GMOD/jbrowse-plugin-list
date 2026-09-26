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
  const cols = line.split('\t')
  return {
    refName: cols[0]!,
    start: +cols[1]!,
    end: +cols[2]!,
    id: cols[3]!,
    rank: +cols[4]!,
    tags: cols[5] ?? '',
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

// Both endpoints of a link are written into every row, so the same link is
// indexed under each endpoint's stable sequence and arrives twice for a region
// covering both. Callers dedupe on linkKey.

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
  const sortedSegments = [...segments.values()].sort((a, b) =>
    a.refName === b.refName ? a.start - b.start : compare(a.refName, b.refName),
  )
  const sortedLinks = [...links.keys()].sort((a, b) => compare(a, b))
  return [
    'H\tVN:Z:1.0',
    ...sortedSegments.map(s => formatSegment(s)),
    ...sortedLinks.map(k => formatLink(links.get(k)!)),
  ].join('\n')
}
