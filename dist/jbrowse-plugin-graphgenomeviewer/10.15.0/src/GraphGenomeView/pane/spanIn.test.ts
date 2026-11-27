import { convertGFAToGraph } from '@jbrowse/bandage-core/gfa/gfaConverter'
import { parseGFA } from '@jbrowse/bandage-core/gfa-core/index'
import { buildNeighbors } from '@jbrowse/bandage-core/referenceSpan'

import { spanIn } from './graphViews'

import type { ThreadEvent } from '@jbrowse/bandage-core/threadFold'

// chr1 runs v1 -> v2; `bubble` is inserted between v1 and v2, and
// `edge` leaves v2 at the window's edge with no flank past it
const GFA = `S\tv1\tAAAAA\tLN:i:5\tSN:Z:chr1\tSO:i:0\tSR:i:0
S\tv2\tCCCCC\tLN:i:5\tSN:Z:chr1\tSO:i:5\tSR:i:0
S\tbubble\tGGG\tLN:i:3\tSN:Z:alt\tSO:i:0\tSR:i:1
S\tedge\tTTTT\tLN:i:4\tSN:Z:alt\tSO:i:0\tSR:i:1
L\tv1\t+\tv2\t+\t0M
L\tv1\t+\tbubble\t+\t0M
L\tbubble\t+\tv2\t+\t0M
L\tv2\t+\tedge\t+\t0M`

const graph = convertGFAToGraph(parseGFA(GFA))
const nodeById = new Map(graph.nodes.map(node => [node.id, node]))
const neighbors = buildNeighbors(graph)

const openEvent: ThreadEvent = {
  text: 'replacement 4 bp for 40 bp, 1 of 2, continues past the window',
  kind: 'other',
  refStart: 10,
  refEnd: 10,
  haplotypes: 1,
  paths: [],
  nodeIds: ['edge+'],
  from: 'v2+',
  to: undefined,
  anchored: true,
  beyond: 50,
}

test('a node takes the span the data gives it: its own, or between two flanks', () => {
  expect(spanIn('v2+', nodeById, neighbors, [])).toEqual({ start: 5, end: 10 })
  expect(spanIn('bubble+', nodeById, neighbors, [])).toEqual({
    start: 5,
    end: 5,
  })
})

test('a node with one flank in the window has no span', () => {
  expect(spanIn('edge+', nodeById, neighbors, undefined)).toBeUndefined()
})

test("a fold's branch that continues past the window spans out to its far breakpoint, over what its one flank would say", () => {
  expect(spanIn('edge+', nodeById, neighbors, [openEvent])).toEqual({
    start: 10,
    end: 50,
  })
})
