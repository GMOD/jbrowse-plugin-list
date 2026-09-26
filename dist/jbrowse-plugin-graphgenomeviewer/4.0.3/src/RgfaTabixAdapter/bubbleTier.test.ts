import Adapter from './RgfaTabixAdapter.ts'
import configSchema from './configSchema.ts'
import { parseGFA } from '../gfa-core/index.ts'

// A level-of-detail tier: the same two files the adapter always reads, but one
// node per bubble instead of one per GFA segment. Built by
// jbrowse-components/scripts/bubbles_to_tier_bed.py from HPRC release 2's
// hosted `hprc-v2.0-mc-grch38.bubbles.bed.gz`, filtered to chrY at
// `--min-content 10000`. The whole chromosome is 57 bubbles and 57 backbone
// nodes in 5.5 kB, which is the point of the tier.
const prefix = require
  .resolve('./test_data/bubble_tier_chrY.segs.bed.gz')
  .replace(/\.segs\.bed\.gz$/, '')

function makeAdapter() {
  const local = (path: string) => ({
    localPath: path,
    locationType: 'LocalPathLocation',
  })
  return new Adapter(
    configSchema.create({
      segmentsLocation: local(`${prefix}.segs.bed.gz`),
      segmentsIndex: { location: local(`${prefix}.segs.bed.gz.tbi`) },
      linksLocation: local(`${prefix}.links.bed.gz`),
      linksIndex: { location: local(`${prefix}.links.bed.gz.tbi`) },
      assemblyNameToPanSN: { hg38: 'GRCh38' },
    }),
  )
}

const wholeChromosome = {
  refName: 'chrY',
  assemblyName: 'hg38',
  start: 0,
  end: 57_227_415,
}

// The claim the tier exists to make: a whole human chromosome is drawable. The
// measured ceiling is a few hundred nodes (reference/PANGENOME_GRAPHS.md, "Force
// layout does not get better with more nodes"), and the fine tier over the same
// span would be six figures of segments.
test('a whole chromosome collapses to a drawable node count', async () => {
  const graph = parseGFA(await makeAdapter().getSubgraph(wholeChromosome))
  expect(graph.nodes.length).toBe(114)
  expect(graph.nodes.length).toBeLessThan(500)
})

test('the collapse summary reaches GraphNode.tags', async () => {
  const graph = parseGFA(await makeAdapter().getSubgraph(wholeChromosome))
  const bubbles = graph.nodes.filter(n => n.tags.ct === 'bubble')
  const backbone = graph.nodes.filter(n => n.tags.ct === 'backbone')
  expect(bubbles).toHaveLength(57)
  expect(backbone).toHaveLength(57)

  // Every bubble states what it collapsed, and the numbers arrive typed.
  expect(
    bubbles.every(n => typeof n.tags.cn === 'number' && n.tags.cn >= 1),
  ).toBe(true)
  expect(bubbles.every(n => typeof n.tags.cl === 'number')).toBe(true)
})

// A pure insertion is an alternative to nothing, so it has no reference span.
// It is drawn 1 bp wide and states its real size in cl, which is why the
// producer thresholds on content rather than on `end - start`.
test('a pure insertion survives as a 1 bp node stating its true length', async () => {
  const graph = parseGFA(await makeAdapter().getSubgraph(wholeChromosome))
  const insertions = graph.nodes.filter(
    n => n.tags.ct === 'bubble' && n.length === 1,
  )
  expect(insertions.length).toBeGreaterThan(0)
  expect(insertions.every(n => (n.tags.cl as number) >= 10000)).toBe(true)
})

// Backbone and bubble strictly alternate, so the tier is one connected chain
// rather than islands, which is what makes it pan-able as a graph.
test('the tier is a connected alternating chain', async () => {
  const gfa = await makeAdapter().getSubgraph(wholeChromosome)
  const graph = parseGFA(gfa)
  const rank = new Map(graph.nodes.map(n => [n.id, n.tags.ct]))
  expect(graph.links.length).toBe(113)
  expect(
    graph.links.every(l => rank.get(l.source) !== rank.get(l.target)),
  ).toBe(true)
})
