import fs from 'fs'
import path from 'path'

import {
  tubeMapLayout,
  tubeMapReferenceLayout,
  tubeMapTracks,
} from './tubeMapLayout'
import { parseGFA } from '../../gfa-core/index'
import { convertGFAToGraph } from '../gfa/gfaConverter'
import { anchorGraph } from '../pathAnchoring'

// Five E. coli haplotypes through a pggb subgraph; IAI39 walks it on the
// reverse strand and CFT073 covers only its right half.
const PGGB = fs.readFileSync(
  path.join(__dirname, '../../../test_data/ecoli_pggb_subgraph.gfa'),
  'utf8',
)

function pggb() {
  return anchorGraph(convertGFAToGraph(parseGFA(PGGB)), 'NCTC86#1#chr')
}

test('the reference path is track 0 and every path is a track', () => {
  const graph = pggb()
  const tracks = tubeMapTracks(graph)
  expect(tracks[0]!.name).toBe('NCTC86#1#chr:1189696-1190158')
  expect(tracks.map(t => t.name).sort()).toEqual(
    graph.paths!.map(p => p.name).sort(),
  )
})

test('a path walking the reverse strand reads its nodes in reverse', () => {
  const tracks = tubeMapTracks(pggb())
  const iai39 = tracks.find(t => t.name.startsWith('IAI39'))!
  expect(iai39.sequence[0]).toBe('-54+')
  const nctc86 = tracks.find(t => t.name.startsWith('NCTC86'))!
  expect(nctc86.sequence.every(step => !step.startsWith('-'))).toBe(true)
})

test('own axis: every node the paths reach is placed, left to right', () => {
  const result = tubeMapLayout(pggb())!
  const { layout } = result.tubeMap!
  expect(Object.keys(result.nodePositions)).toHaveLength(
    layout.nodes.filter(n => n.order >= 0).length,
  )
  const reference = layout.tracks.find(t => t.name?.startsWith('NCTC86'))!
  const xs = reference.path.flatMap(seg =>
    seg.node === null ? [] : [layout.nodes[seg.node]!.x],
  )
  for (let i = 1; i < xs.length; i++) {
    expect(xs[i]!).toBeGreaterThan(xs[i - 1]!)
  }
  expect(result.referenceAxis).toBeUndefined()
})

test('reference axis: columns run left to right over the cut in bp', () => {
  const graph = pggb()
  const result = tubeMapReferenceLayout(graph)!
  const columns = result.tubeMap!.columns!
  for (let i = 1; i < columns.length; i++) {
    expect(columns[i]!.bp0).toBeGreaterThanOrEqual(columns[i - 1]!.bp1)
    expect(columns[i]!.x0).toBeGreaterThan(columns[i - 1]!.x0)
  }
  expect(columns[0]!.bp0).toBe(1189696)
  expect(columns.at(-1)!.bp1).toBe(1190158)
  expect(result.referenceAxis).toBe(true)
  expect(result.pixelRows).toBe(true)
})

// alt carries 7 bp the reference does not, between the same flanks
const INSERTION = `S\t1\tACGTACGTAC
S\t2\tGGGGGGG
S\t3\tTTTTTTTTTT
L\t1\t+\t2\t+\t0M
L\t2\t+\t3\t+\t0M
L\t1\t+\t3\t+\t0M
P\tref#1#chr:100-120\t1+,3+\t*
P\talt#1#chr:200-227\t1+,2+,3+\t*`

test('a column of inserted sequence covers no reference', () => {
  const graph = anchorGraph(convertGFAToGraph(parseGFA(INSERTION)), 'ref#1#chr')
  const { columns } = tubeMapReferenceLayout(graph)!.tubeMap!
  expect(columns!.map(c => [c.bp0, c.bp1])).toEqual([
    [100, 110],
    [110, 110],
    [110, 120],
  ])
})

test('no layout without paths', () => {
  const graph = { ...pggb(), paths: [] }
  expect(tubeMapLayout(graph)).toBeUndefined()
  expect(tubeMapReferenceLayout(graph)).toBeUndefined()
})
