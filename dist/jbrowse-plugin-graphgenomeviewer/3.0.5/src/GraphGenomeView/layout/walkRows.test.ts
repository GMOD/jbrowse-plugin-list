import { existsSync, readFileSync } from 'fs'

import { walkRows } from './walkRows'
import { parseGFA } from '../../gfa-core/index'
import { convertGFAToGraph } from '../gfa/gfaConverter'
import { anchorGraph, pathOrigin } from '../pathAnchoring'

function pggbGraph() {
  const gfa = readFileSync(
    require.resolve('../../../test_data/ecoli_pggb_subgraph.gfa'),
    'utf8',
  )
  return anchorGraph(convertGFAToGraph(parseGFA(gfa), 'pggb'), 'K12')
}

const KIV2 = '.test-jbrowse-variants/test_data/graphgenomeview/kiv2_eight.gfa'

test('one row per non-reference path, longest first, bp summed over its nodes', () => {
  const graph = pggbGraph()
  const result = walkRows(graph)!
  expect(result.reference.label).toBe('K12')
  expect(result.rows.map(r => r.label).sort()).toEqual([
    'CFT073',
    'IAI39',
    'NCTC86',
    'Sakai',
  ])
  for (let i = 1; i < result.rows.length; i++) {
    expect(result.rows[i - 1]!.bp).toBeGreaterThanOrEqual(result.rows[i]!.bp)
  }
  const byId = new Map(graph.nodes.map(n => [n.id, n.length]))
  for (const row of [result.reference, ...result.rows]) {
    const path = graph.paths!.find(p => p.name === row.name)!
    const total = path.nodeIds.reduce((s, id) => s + byId.get(id)!, 0)
    expect(row.bp).toBe(total)
    expect(row.runs.reduce((s, r) => s + r.bp, 0)).toBe(total)
    expect(row.complete).toBe(true)
  }
  expect(result.reference.offReferenceBp).toBe(0)
})

test('runs alternate and cover the row without gaps', () => {
  const { rows } = walkRows(pggbGraph())!
  for (const row of rows) {
    let pos = 0
    row.runs.forEach((run, i) => {
      expect(run.start).toBe(pos)
      if (i > 0) {
        expect(run.onReference).not.toBe(row.runs[i - 1]!.onReference)
      }
      pos += run.bp
    })
  }
})

test('a region measures between its flanking reference nodes', () => {
  const graph = pggbGraph()
  const byId = new Map(graph.nodes.map(n => [n.id, n.length]))
  const reference = graph.paths!.find(
    p => pathOrigin(p.name).name === graph.referencePath,
  )!
  const start = graph.anchorPaths!.find(
    p => p.name === graph.referencePath,
  )!.start
  const ends = [start]
  for (const id of reference.nodeIds) {
    ends.push(ends.at(-1)! + byId.get(id)!)
  }
  const n = reference.nodeIds.length
  // flanks are the 2nd node and the 2nd-to-last, so the slice is nodes 2..n-3
  const region = { start: ends[2]!, end: ends[n - 2]! }
  const cut = walkRows(graph, region)!
  expect(cut.origin).toBe(region.start)
  expect(cut.reference.bp).toBe(ends[n - 2]! - ends[2]!)
  expect(cut.reference.complete).toBe(true)
  const whole = walkRows(graph)!
  expect(cut.reference.bp).toBeLessThan(whole.reference.bp)
})

test('a walk that skips the flanking node is cut at the next one it visits', () => {
  const graph = pggbGraph()
  const byId = new Map(graph.nodes.map(n => [n.id, n.length]))
  const reference = graph.paths!.find(
    p => pathOrigin(p.name).name === graph.referencePath,
  )!
  const start = graph.anchorPaths!.find(
    p => p.name === graph.referencePath,
  )!.start
  const ends = [start]
  for (const id of reference.nodeIds) {
    ends.push(ends.at(-1)! + byId.get(id)!)
  }
  const n = reference.nodeIds.length
  const region = { start: ends[3]!, end: ends[n - 3]! }
  const skipper = {
    ...reference,
    name: 'skipper',
    nodeIds: reference.nodeIds.filter((_, i) => i !== 2 && i !== n - 3),
  }
  const cut = walkRows({ ...graph, paths: [...graph.paths!, skipper] }, region)!
  const row = cut.rows.find(r => r.name === 'skipper')!
  expect(row.complete).toBe(true)
  expect(row.bp).toBe(cut.reference.bp)
})

// The numbers scripts/layout-lab/copycount.mjs reports for the hosted
// eight-haplotype KIV-2 cut: GRCh38 about 33 kb through the window, HG00133
// about 149 kb, so HG00133 carries roughly 21 more units of 5,548 bp.
test.skipIf(!existsSync(KIV2))(
  'KIV-2: HG00133 carries ~116 kb GRCh38 does not',
  () => {
    const graph = anchorGraph(
      convertGFAToGraph(parseGFA(readFileSync(KIV2, 'utf8')), 'kiv2'),
      'GRCh38',
    )
    const result = walkRows(graph)!
    expect(result.reference.label).toBe('GRCh38#0')
    expect(result.reference.bp).toBeGreaterThan(32_000)
    expect(result.reference.bp).toBeLessThan(34_000)
    expect(result.rows[0]!.label).toBe('HG00133#1')
    expect(result.rows[0]!.bp).toBeGreaterThan(145_000)
    expect(result.rows[0]!.offReferenceBp / 5548).toBeGreaterThan(19)
    expect(result.rows.map(r => r.label)).toHaveLength(8)
  },
)

test('a cut that stops at the window leaves whole walks, not partial ones', () => {
  const graph = pggbGraph()
  const byId = new Map(graph.nodes.map(n => [n.id, n.length]))
  const reference = graph.paths!.find(
    p => pathOrigin(p.name).name === graph.referencePath,
  )!
  const start = graph.anchorPaths!.find(
    p => p.name === graph.referencePath,
  )!.start
  let end = start
  for (const id of reference.nodeIds) {
    end += byId.get(id)!
  }
  // the region IS the reference walk, so no node lies outside it
  const rows = walkRows(graph, { start, end })!
  expect(rows.rows.every(r => r.complete)).toBe(true)
  expect(rows.reference.complete).toBe(true)
})

test('a walk that crosses the window backwards reads in reference direction', () => {
  const graph = pggbGraph()
  const byId = new Map(graph.nodes.map(n => [n.id, n.length]))
  const reference = graph.paths!.find(
    p => pathOrigin(p.name).name === graph.referencePath,
  )!
  const start = graph.anchorPaths!.find(
    p => p.name === graph.referencePath,
  )!.start
  const ends = [start]
  for (const id of reference.nodeIds) {
    ends.push(ends.at(-1)! + byId.get(id)!)
  }
  const n = reference.nodeIds.length
  const region = { start: ends[2]!, end: ends[n - 2]! }
  const forward = walkRows(graph, region)!.rows.find(
    r => r.complete && r.runs.length > 1,
  )!
  expect(forward).toBeDefined()
  const path = graph.paths!.find(p => p.name === forward.name)!
  const backwards = {
    ...path,
    name: 'backwards',
    nodeIds: [...path.nodeIds].reverse(),
  }
  const cut = walkRows(
    { ...graph, paths: [...graph.paths!, backwards] },
    region,
  )!
  const row = cut.rows.find(r => r.name === 'backwards')!
  expect(row.complete).toBe(true)
  expect(row.runs).toEqual(forward.runs)
})
