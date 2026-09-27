import { READ_WIDTH, layoutTubeMap } from '@gmod/tubemap-core'

import { tubeMapMismatches } from './mismatches'

import type {
  InputNode,
  InputTrack,
  Mismatch,
  TubeMapLayout,
} from '@gmod/tubemap-core'

// ref walks 1 2 4, alt 1 3 4; ten bases a node so a base is 1/10 of a node
const nodes: InputNode[] = [
  { name: '1', seq: 'ACGTACGTAC' },
  { name: '2', seq: 'AAAAAAAAAA' },
  { name: '3', seq: 'GGGGGGGGGG' },
  { name: '4', seq: 'TTTTTTTTTT' },
]
const tracks: InputTrack[] = [
  { id: 0, name: 'ref', sequence: ['1', '2', '4'], sourceTrackID: 0 },
  { id: 1, name: 'alt', sequence: ['1', '3', '4'], sourceTrackID: 0 },
]

function read(
  id: number,
  steps: [string, Mismatch[]][],
  firstNodeOffset = 0,
  finalNodeCoverLength = 10,
): InputTrack {
  return {
    id,
    name: `r${id}`,
    type: 'read',
    sourceTrackID: 1,
    sequence: steps.map(([name]) => name),
    sequenceNew: steps.map(([nodeName, mismatches]) => ({
      nodeName,
      mismatches,
    })),
    firstNodeOffset,
    finalNodeCoverLength,
  }
}

function lay(reads: InputTrack[]) {
  return layoutTubeMap(nodes, tracks, reads, { mergeNodes: false })!
}

function node(layout: TubeMapLayout, name: string) {
  return layout.nodes[layout.nodeMap.get(name)!]!
}

// the x the layout gives a base: the node's span plus 4 units of stroke each
// side, divided evenly over its ten bases
function baseX(layout: TubeMapLayout, name: string, pos: number) {
  const n = node(layout, name)
  return n.x - 4 + (pos / 10) * (n.pixelWidth + 8)
}

test('a substitution spans its bases on the tube of the read that carries it', () => {
  const layout = lay([
    read(0, [
      ['1', [{ type: 'substitution', pos: 2, seq: 'TT' }]],
      ['3', []],
    ]),
  ])
  const [mark] = tubeMapMismatches(layout)
  const segment = layout.reads[0]!.path.find(
    s => s.node === layout.nodeMap.get('1'),
  )!
  expect(mark).toEqual({
    kind: 'substitution',
    readId: 0,
    x0: baseX(layout, '1', 2),
    x1: baseX(layout, '1', 4),
    seq: 'TT',
    y: segment.y,
    height: READ_WIDTH,
    nodeY: node(layout, '1').y,
  })
})

test('a deletion spans the bases it skips', () => {
  const layout = lay([
    read(0, [
      ['1', []],
      ['3', []],
      ['4', [{ type: 'deletion', pos: 3, length: 4 }]],
    ]),
  ])
  const [mark] = tubeMapMismatches(layout)
  expect(mark).toMatchObject({
    kind: 'deletion',
    x0: baseX(layout, '4', 3),
    x1: baseX(layout, '4', 7),
  })
})

test('an insertion at either end of the read is a soft clip', () => {
  const layout = lay([
    read(
      0,
      [
        ['1', [{ type: 'insertion', pos: 1, seq: 'CC' }]],
        ['3', [{ type: 'insertion', pos: 5, seq: 'A' }]],
        ['4', [{ type: 'insertion', pos: 6, seq: 'GG' }]],
      ],
      1,
      6,
    ),
  ])
  expect(
    tubeMapMismatches(layout).map(m => m.kind === 'insertion' && m.softClip),
  ).toEqual([true, false, true])
})

test('a mark past its node has no place and is dropped', () => {
  const layout = lay([
    read(0, [
      ['1', [{ type: 'substitution', pos: 9, seq: 'AAA' }]],
      ['3', []],
    ]),
  ])
  expect(tubeMapMismatches(layout)).toEqual([])
})

test('a reverse read marks the base the layout mirrored it to', () => {
  // the layout turns a wholly reverse read around, so position 2 of node 4
  // read backwards is position 10 - 2 - 1 = 7 read forwards
  const layout = lay([
    read(0, [
      ['-4', [{ type: 'substitution', pos: 2, seq: 'A' }]],
      ['-3', []],
    ]),
  ])
  const [mark] = tubeMapMismatches(layout)
  expect(mark).toMatchObject({
    kind: 'substitution',
    x0: baseX(layout, '4', 7),
    x1: baseX(layout, '4', 8),
  })
})

test('haplotype tracks carry no marks', () => {
  expect(tubeMapMismatches(lay([]))).toEqual([])
})
