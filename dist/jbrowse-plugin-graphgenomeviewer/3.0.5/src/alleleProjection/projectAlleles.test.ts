import { readFileSync } from 'fs'

import { parsePanSN, projectAlleles } from './projectAlleles'
import { isOffReference } from '../GraphGenomeView/anchoredNodes'
import { convertGFAToGraph } from '../GraphGenomeView/gfa/gfaConverter'
import { parseGFA } from '../gfa-core/index'

// The real four-strain minigraph slice, not invented coordinates: K12 is the
// rank-0 backbone, Sakai/CFT073/NCTC86 contribute ranks 1-3.
function ecoliGraph() {
  const gfa = readFileSync(
    require.resolve('../../test_data/ecoli_rgfa_slice.gfa'),
    'utf8',
  )
  return convertGFAToGraph(parseGFA(gfa), 'ecoli')
}

test('rGFA carries no walks, so the projection cannot depend on them', () => {
  const graph = ecoliGraph()
  expect(graph.paths ?? []).toHaveLength(0)
  expect(projectAlleles(graph).length).toBeGreaterThan(0)
})

test('anchors alleles on the reference and places each node within its run', () => {
  const alleles = projectAlleles(ecoliGraph())
  for (const allele of alleles) {
    expect(allele.refSpan).toBeGreaterThanOrEqual(0)
    expect(allele.nodeIds.length).toBeGreaterThan(0)
    expect(allele.nodeOffsets).toHaveLength(allele.nodeIds.length)
    expect(Math.min(...allele.nodeOffsets)).toBe(0)
    expect(allele.pathLength).toBeGreaterThanOrEqual(
      Math.max(...allele.nodeOffsets),
    )
  }
  for (let i = 1; i < alleles.length; i++) {
    expect(alleles[i]!.start).toBeGreaterThanOrEqual(alleles[i - 1]!.start)
  }
})

// The naive per-segment version produced refSpan -22067 here by taking whichever
// anchor it saw last; a negative span must never be emitted, and a run with one
// anchor at the window's edge is left out rather than given one.
test('declines to state a span rather than emitting a backwards one', () => {
  const graph = ecoliGraph()
  const alleles = projectAlleles(graph)
  expect(alleles.every(a => a.refSpan >= 0)).toBe(true)
  const placed = new Set(alleles.flatMap(a => a.nodeIds))
  const unanchored = graph.nodes.filter(
    n => isOffReference(n) && !placed.has(n.id),
  )
  expect(unanchored.length).toBeGreaterThan(0)
})

test('chains multi-segment bubble paths into one allele', () => {
  const alleles = projectAlleles(ecoliGraph())
  const multi = alleles.filter(a => a.nodeIds.length > 1)
  expect(multi.length).toBeGreaterThan(0)
  for (const a of multi) {
    expect(new Set(a.nodeIds).size).toBe(a.nodeIds.length)
    expect(a.pathLength).toBeGreaterThan(0)
  }
})

test('parsePanSN reads sample and haplotype, tolerating bare contig names', () => {
  expect(parsePanSN('HG01433.2#2#CM086507.1')).toEqual({
    sample: 'HG01433.2',
    haplotype: 2,
  })
  expect(parsePanSN('K12#1#chr')).toEqual({ sample: 'K12', haplotype: 1 })
  expect(parsePanSN('chr1')).toEqual({ sample: 'chr1', haplotype: undefined })
})

test('an empty graph projects to nothing rather than throwing', () => {
  expect(projectAlleles({ name: 'empty', nodes: [], edges: [] })).toEqual([])
})
