import fs from 'fs'
import path from 'path'

import { tubeMapReads } from './reads'
import { parseGaf, parseGafLine } from '../../gaf/parseGaf'
import { parseGFA } from '../../gfa-core/index'
import { convertGFAToGraph } from '../gfa/gfaConverter'
import { tubeMapLayout } from '../layout/tubeMapLayout'
import { anchorGraph } from '../pathAnchoring'

// Nodes 240..280 of sequenceTubeMap's cactus example, a run of SNP bubbles,
// with the NA12879 reads vg giraffe aligned over them. Node lengths used below:
// 249 is 100 bp, 250 is 27, 251 is 1 and 253 is 11.
const dir = path.join(__dirname, '../../../test_data/cactus')
const GFA = fs.readFileSync(path.join(dir, 'cactus_240_280.gfa'), 'utf8')
const GAF = fs.readFileSync(path.join(dir, 'cactus_240_280.gaf'), 'utf8')

function cactus() {
  return anchorGraph(convertGFAToGraph(parseGFA(GFA)), 'ref')
}

function gaf(pathColumn: string, rest: string) {
  return parseGafLine(`r\t101\t0\t101\t+\t${pathColumn}\t${rest}`)!
}

test('edits land on the node they fall in, split at node boundaries', () => {
  const record = gaf(
    '>249>250>251>253',
    '139\t36\t133\t96\t101\t60\tcs:Z::70*ag:19-ac+tt:5',
  )
  const [read] = tubeMapReads(cactus(), [record], 3)
  expect(read!.sequence).toEqual(['249+', '250+', '251+', '253+'])
  expect(read!.sequenceNew!.map(e => e.mismatches)).toEqual([
    [],
    [
      { type: 'substitution', pos: 6, seq: 'G' },
      { type: 'deletion', pos: 26, length: 1 },
    ],
    [{ type: 'deletion', pos: 0, length: 1 }],
    [{ type: 'insertion', pos: 0, seq: 'TT' }],
  ])
  expect(read).toMatchObject({
    id: 3,
    type: 'read',
    firstNodeOffset: 36,
    finalNodeCoverLength: 5,
    mapping_quality: 60,
  })
})

test('a read running out of the cut keeps its steps inside it', () => {
  // 999 is not in the cut, so positions count back from the walk's end
  const record = gaf(
    '>999>249>250',
    '177\t10\t170\t100\t101\t60\tcs:Z::100*ac:59',
  )
  const [read] = tubeMapReads(cactus(), [record], 0)
  expect(read!.sequence).toEqual(['249+', '250+'])
  expect(read!.sequenceNew![0]!.mismatches).toEqual([
    { type: 'substitution', pos: 60, seq: 'C' },
  ])
  expect(read!.firstNodeOffset).toBe(0)
  expect(read!.finalNodeCoverLength).toBe(20)
})

test('a read walking the graph backwards visits its nodes in reverse', () => {
  const record = gaf('<250<249', '127\t2\t120\t100\t101\t60')
  const [read] = tubeMapReads(cactus(), [record], 0)
  expect(read!.sequence).toEqual(['-250+', '-249+'])
})

test('a read touching no node of the cut is dropped', () => {
  const record = gaf('>998>999', '20\t0\t20\t20\t20\t60')
  expect(tubeMapReads(cactus(), [record], 0)).toEqual([])
})

test('the tube map stacks the reads in the node boxes', () => {
  const records = parseGaf(GAF)
  const bare = tubeMapLayout(cactus())!.tubeMap!.layout
  const layout = tubeMapLayout({ ...cactus(), reads: records })!.tubeMap!.layout
  expect(layout.reads).toHaveLength(records.length)
  expect(
    layout.shapes.rectangles.filter(r => r.type === 'read').length,
  ).toBeGreaterThan(0)
  expect(layout.bounds.maxY - layout.bounds.minY).toBeGreaterThan(
    bare.bounds.maxY - bare.bounds.minY,
  )
})
