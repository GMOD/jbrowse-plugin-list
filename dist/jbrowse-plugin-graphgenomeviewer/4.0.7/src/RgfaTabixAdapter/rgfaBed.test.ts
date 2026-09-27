import {
  formatSubgraph,
  parseLinkLine,
  parseSegmentLine,
  segmentSamples,
} from './rgfaBed.ts'

import type { RgfaLink, RgfaSegment } from './rgfaBed.ts'

// A five-column row is what `gfatools gfa2bed -m` writes for an rGFA. There is
// no tag column at all, which is the backward-compatible case.
const RGFA_SEG = 'K12#1#chr\t100\t150\ts1\t0'

// A six-column row is what a path walk or a level-of-detail tier writes. The
// sixth column is a space-separated GFA tag list.
const TAGGED_SEG =
  'GRCh38#0#chr1\t103611080\t103732636\ts10472\t1\t' +
  'ct:Z:bubble cn:i:95 cw:i:269401 cs:i:26889 cl:i:316616 cv:i:1'

function subgraphOf(segments: RgfaSegment[], links: RgfaLink[] = []) {
  return formatSubgraph(
    new Map(segments.map(s => [s.id, s])),
    new Map(links.map((l, i) => [String(i), l])),
  )
}

test('an rGFA row has no tags and synthesizes the S-line it always did', () => {
  const segment = parseSegmentLine(RGFA_SEG)
  expect(segment.tags).toBe('')
  expect(subgraphOf([segment])).toBe(
    ['H\tVN:Z:1.0', 'S\ts1\t*\tLN:i:50\tSN:Z:K12#1#chr\tSO:i:100\tSR:i:0'].join(
      '\n',
    ),
  )
})

test('a tag column reaches the S-line as tab-separated GFA tags', () => {
  const segment = parseSegmentLine(TAGGED_SEG)
  expect(segment.tags).toBe(
    'ct:Z:bubble cn:i:95 cw:i:269401 cs:i:26889 cl:i:316616 cv:i:1',
  )
  expect(subgraphOf([segment])).toBe(
    [
      'H\tVN:Z:1.0',
      'S\ts10472\t*\tLN:i:121556\tSN:Z:GRCh38#0#chr1\tSO:i:103611080\tSR:i:1' +
        '\tct:Z:bubble\tcn:i:95\tcw:i:269401\tcs:i:26889\tcl:i:316616\tcv:i:1',
    ].join('\n'),
  )
})

// A segment can enter a subgraph only through a link row, when the region
// covers one endpoint and its neighbour sits elsewhere, so the endpoint records
// carry tags too or a tier node reached that way would lose its summary.
test('link rows carry each endpoint tags', () => {
  const link = parseLinkLine(
    [
      'GRCh38#0#chr1',
      '0',
      '10',
      's1+',
      's2+',
      'GRCh38#0#chr1',
      '0',
      '10',
      '0',
      'GRCh38#0#chr1',
      '10',
      '20',
      '1',
      'ct:Z:backbone',
      'ct:Z:bubble cl:i:104730',
    ].join('\t'),
  )
  expect(link.sourceSegment.tags).toBe('ct:Z:backbone')
  expect(link.targetSegment.tags).toBe('ct:Z:bubble cl:i:104730')
  expect(subgraphOf([link.sourceSegment, link.targetSegment], [link])).toBe(
    [
      'H\tVN:Z:1.0',
      'S\ts1\t*\tLN:i:10\tSN:Z:GRCh38#0#chr1\tSO:i:0\tSR:i:0\tct:Z:backbone',
      'S\ts2\t*\tLN:i:10\tSN:Z:GRCh38#0#chr1\tSO:i:10\tSR:i:1\tct:Z:bubble\tcl:i:104730',
      'L\ts1\t+\ts2\t+\t0M',
    ].join('\n'),
  )
})

// An older six-column file from build_pggb_tabix.sh wrote a bare comma list
// rather than a tag. It must not be emitted as a malformed GFA tag.
test('a link row with no tag columns parses as untagged', () => {
  const link = parseLinkLine('c\t0\t10\ts1+\ts2+\tc\t0\t10\t0\tc\t10\t20\t1')
  expect(link.sourceSegment.tags).toBe('')
  expect(link.targetSegment.tags).toBe('')
})

// build_pggb_tabix.sh wrote a bare comma list in column 6 before the tag column
// existed. Those files are still hosted, and a bare list is not a GFA tag.
test('a legacy bare sample list is dropped rather than emitted as a tag', () => {
  const segment = parseSegmentLine('c\t0\t10\ts1\t1\tK12,Sakai,CFT073')
  expect(segment.tags).toBe('K12,Sakai,CFT073')
  expect(subgraphOf([segment])).toBe(
    ['H\tVN:Z:1.0', 'S\ts1\t*\tLN:i:10\tSN:Z:c\tSO:i:0\tSR:i:1'].join('\n'),
  )
})

test('a valid tag beside a malformed one keeps only the valid one', () => {
  const segment = parseSegmentLine('c\t0\t10\ts1\t1\tgarbage SM:Z:HG002.1')
  expect(subgraphOf([segment])).toBe(
    [
      'H\tVN:Z:1.0',
      'S\ts1\t*\tLN:i:10\tSN:Z:c\tSO:i:0\tSR:i:1\tSM:Z:HG002.1',
    ].join('\n'),
  )
})

test('segmentSamples reads the carriers off the tag column', () => {
  const segment = parseSegmentLine(
    'K12#1#chr\t1004477\t1004500\ts119690\t0\tSM:Z:K12.1,Sakai.1,NCTC86.1',
  )
  expect(segmentSamples(segment)).toEqual(['K12.1', 'Sakai.1', 'NCTC86.1'])
})

// Undefined, not [], so a lane can tell a graph that states nothing about
// carriage apart from a segment nothing carries.
test('segmentSamples is undefined when the column says nothing', () => {
  expect(segmentSamples(parseSegmentLine(RGFA_SEG))).toBeUndefined()
  expect(segmentSamples(parseSegmentLine(TAGGED_SEG))).toBeUndefined()
})

// Same reason formatSegment checks the grammar: build_pggb_tabix.sh wrote a
// bare comma list here before the tag column existed, and reading it would
// invent a single sample named after the whole list.
test('segmentSamples drops a legacy bare sample list', () => {
  const segment = parseSegmentLine('c\t0\t10\ts1\t1\tK12,Sakai,CFT073')
  expect(segmentSamples(segment)).toBeUndefined()
})

test('segmentSamples finds the tag beside other tags', () => {
  const segment = parseSegmentLine(
    'c\t0\t10\ts1\t1\tct:Z:bubble SM:Z:HG002.1,HG002.2 cn:i:95',
  )
  expect(segmentSamples(segment)).toEqual(['HG002.1', 'HG002.2'])
})

// The whole carriage chain in one test, because it spans three files and each
// half is covered on its own: a segs.bed SM:Z: column -> the synthesized S-line
// -> the GFA parser -> GraphNode.samples, which is what model.ts renders as
// `carriedBy` in the node popup. An indexed cut has no P/W lines, so this tag is
// the only statement of carriage it can carry, and nothing else asserts that it
// survives the round trip.
test('SM:Z: on a segs row reaches GraphNode.samples', async () => {
  const { parseGFA } = await import('../gfa-core/index.ts')
  const { convertGFAToGraph } =
    await import('../GraphGenomeView/gfa/gfaConverter.ts')
  const segment = parseSegmentLine(
    'K12#1#chr\t1004477\t1004500\ts119690\t0\tSM:Z:K12.1,Sakai.1,NCTC86.1',
  )
  const graph = convertGFAToGraph(parseGFA(subgraphOf([segment])))
  expect(graph.nodes[0]!.samples).toEqual(['K12.1', 'Sakai.1', 'NCTC86.1'])
})
