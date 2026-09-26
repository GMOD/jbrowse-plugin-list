import { expect, test } from 'vitest'

import {
  contributingAssemblies,
  locString,
  nodeOwnLocation,
  resolveContributors,
  resolveLocationAssembly,
} from './contributors'

import type { Graph, GraphNode } from '../GraphGenomeView/types'

function node(
  id: string,
  refName: string,
  start: number,
  length: number,
  rank: number,
): GraphNode {
  return {
    id,
    name: id,
    length,
    depth: 1,
    stable: { refName, start, rank },
  }
}

function graph(nodes: GraphNode[]): Graph {
  return { name: 'test', nodes, edges: [] }
}

test('a node states its own assembly and coordinates', () => {
  expect(nodeOwnLocation(node('s1', 'CFT073#1#chr', 1044024, 226, 2))).toEqual({
    sample: 'CFT073',
    haplotype: 'CFT073#1',
    refName: 'chr',
    start: 1044024,
    end: 1044250,
  })
})

// A plain-GFA segment has no SN/SO at all, so it belongs to no assembly. The
// launch has nothing to offer for it, which is different from offering the
// reference by default.
test('an unanchored node has no location', () => {
  expect(
    nodeOwnLocation({ id: 's1', name: 's1', length: 10, depth: 1 }),
  ).toBeUndefined()
})

test('contributors are the assemblies named on the segments, reference first', () => {
  const contributors = contributingAssemblies(
    graph([
      node('s1', 'K12#1#chr', 1000, 500, 0),
      node('s2', 'K12#1#chr', 2000, 500, 0),
      node('s3', 'Sakai#1#chr', 90000, 300, 1),
      node('s4', 'CFT073#1#chr', 5000, 100, 2),
    ]),
  )
  // reference first, then by name, matching the sample-rows layout's rows
  expect(contributors.map(c => c.sample)).toEqual(['K12', 'CFT073', 'Sakai'])
  expect(contributors[0]).toEqual({
    sample: 'K12',
    haplotype: 'K12#1',
    refName: 'chr',
    start: 1000,
    end: 2500,
    rank: 0,
    nodeCount: 2,
  })
})

// A sample contributing sequence from a distant duplication would otherwise
// yield a locus spanning both, and a linear view opened on it shows neither.
test('a distant second locus does not widen a contributor to cover both', () => {
  const [sakai] = contributingAssemblies(
    graph([
      node('s1', 'K12#1#chr', 0, 10000, 0),
      node('s2', 'Sakai#1#chr', 50000, 400, 1),
      node('s3', 'Sakai#1#chr', 50600, 400, 1),
      node('s4', 'Sakai#1#chr', 3000000, 100, 1),
    ]),
    { maxGap: 10000 },
  ).filter(c => c.sample === 'Sakai')
  expect(sakai).toEqual({
    sample: 'Sakai',
    haplotype: 'Sakai#1',
    refName: 'chr',
    start: 50000,
    end: 51000,
    rank: 1,
    nodeCount: 3,
  })
})

// A session that has loaded exactly these assemblies, under exactly these names.
const loaded =
  (...names: string[]) =>
  (sample: string) =>
    names.includes(sample) ? sample : undefined

// The HPRC case: hundreds of contributing haplotypes, one loaded assembly. Only
// the reference can be opened, and that is the honest answer rather than a menu
// full of items that would fail.
test('only contributors naming a loaded assembly are openable', () => {
  const contributors = contributingAssemblies(
    graph([
      node('s1', 'GRCh38#0#chr6', 31000000, 5000, 0),
      node('s2', 'HG02717#1#chr6', 12000, 300, 1),
      node('s3', 'HG00438#2#chr6', 900000, 300, 1),
    ]),
  )
  expect(contributors).toHaveLength(3)
  expect(resolveContributors(contributors, loaded('hg38'))).toEqual([])
  expect(
    resolveContributors(contributors, loaded('GRCh38', 'hg38')).map(
      c => c.sample,
    ),
  ).toEqual(['GRCh38'])
})

// The graph's spelling of an assembly and the session's need not agree: HPRC
// writes `CHM13` where the assembly is UCSC's `hs1`. The launch has to name the
// assembly, so the resolver's answer replaces the sample.
test('a contributor resolves through an assembly alias, under its own name', () => {
  const contributors = contributingAssemblies(
    graph([
      node('s1', 'GRCh38#0#chr17', 83000000, 5000, 0),
      node('s2', 'CHM13#0#chr17', 83899576, 142227, 61),
    ]),
  )
  const resolve = (sample: string) =>
    sample === 'CHM13' ? 'hs1' : sample === 'GRCh38' ? 'hg38' : undefined
  expect(resolveContributors(contributors, resolve).map(c => c.sample)).toEqual(
    ['hg38', 'hs1'],
  )
  // and the locus travels with it, rather than being dropped on rename
  expect(
    resolveContributors(contributors, resolve).find(c => c.sample === 'hs1'),
  ).toMatchObject({ refName: 'chr17', start: 83899576, end: 84041803 })
})

test('a locstring is 1-based inclusive', () => {
  expect(locString({ sample: 'K12', refName: 'chr', start: 0, end: 100 })).toBe(
    'chr:1-100',
  )
})

// HPRC release 2.1 names every node `sample#hap#contig`, so one sample is two
// contributors, and a session holding both haplotypes opens the right one; a
// haplotype loaded under its bare sample name still resolves, at sample depth.
test('a haplotype-named graph contributes per haplotype, resolved at that depth before the sample', () => {
  const contributors = contributingAssemblies(
    graph([
      node('s1', 'GRCh38#0#chr6', 32517112, 304, 0),
      node('s2', 'NA20809#2#CM094351.1', 32495296, 1780, 10),
      node('s3', 'NA20809#1#CM094300.1', 32495000, 900, 11),
    ]),
  )
  expect(contributors.map(c => [c.sample, c.haplotype])).toEqual([
    ['GRCh38', 'GRCh38#0'],
    ['NA20809', 'NA20809#1'],
    ['NA20809', 'NA20809#2'],
  ])
  const byHaplotype = (sample: string) =>
    ({ 'NA20809#2': 'NA20809.2', 'NA20809#1': 'NA20809.1', GRCh38: 'hg38' })[
      sample
    ]
  expect(
    resolveContributors(contributors, byHaplotype).map(c => c.sample),
  ).toEqual(['hg38', 'NA20809.1', 'NA20809.2'])
  const bySample = (sample: string) =>
    sample === 'NA20809' ? 'NA20809' : sample === 'GRCh38' ? 'hg38' : undefined
  expect(
    resolveContributors(contributors, bySample).map(c => [c.sample, c.refName]),
  ).toEqual([
    ['hg38', 'chr6'],
    ['NA20809', 'CM094300.1'],
    ['NA20809', 'CM094351.1'],
  ])
  expect(
    resolveLocationAssembly(byHaplotype, {
      sample: 'NA20809',
      haplotype: 'NA20809#2',
    }),
  ).toBe('NA20809.2')
  expect(
    resolveLocationAssembly(bySample, {
      sample: 'NA20809',
      haplotype: 'NA20809#2',
    }),
  ).toBe('NA20809')
  expect(
    resolveLocationAssembly(bySample, { sample: 'K12', haplotype: undefined }),
  ).toBeUndefined()
})
