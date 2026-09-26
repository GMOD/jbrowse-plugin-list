import { bubbleHalos } from './bubbleHalos'
import { parseGFA } from '../../gfa-core/index'
import { convertGFAToGraph } from '../gfa/gfaConverter'

// v1 -> v2 -> v3 on chr1, a1 replacing v2: the bubble's row names all four,
// and the halo covers v2 and a1 only.
const GFA = `S\tv1\tAAAA\tSN:Z:chr1\tSO:i:0\tSR:i:0
S\tv2\tCC\tSN:Z:chr1\tSO:i:4\tSR:i:0
S\tv3\tGGG\tSN:Z:chr1\tSO:i:6\tSR:i:0
S\ta1\tT\tSN:Z:foo\tSO:i:0\tSR:i:1
L\tv1\t+\tv2\t+\t0M
L\tv2\t+\tv3\t+\t0M
L\tv1\t+\ta1\t+\t0M
L\ta1\t+\tv3\t+\t0M`

const graph = convertGFAToGraph(parseGFA(GFA))
const bubble = {
  refName: 'chr1',
  start: 4,
  end: 6,
  segmentCount: 4,
  pathCount: 2,
  inversion: false,
  shortestAlleleLength: 1,
  longestAlleleLength: 2,
  segments: 'v1,v2,a1,v3',
  shortestAllele: undefined,
  longestAllele: undefined,
}
const positions = {
  'v1+': [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ],
  'v2+': [
    { x: 12, y: 0 },
    { x: 20, y: 0.004 },
  ],
  'v3+': [
    { x: 22, y: 0 },
    { x: 30, y: 0 },
  ],
  'a1+': [{ x: 16, y: -8 }],
}

test('the halo runs along the nodes inside the bubble, not its anchors', () => {
  const [halo] = bubbleHalos(graph, [bubble], positions)
  expect(halo).toMatchObject({
    kind: 'deletion',
    path: 'M12,0L20,0M16,-8L16,-8',
    top: { x: 16, y: -8 },
    members: 2,
  })
})

test('a bubble whose nodes are not drawn has no halo', () => {
  expect(bubbleHalos(graph, [bubble], { 'v1+': positions['v1+'] })).toEqual([])
})
