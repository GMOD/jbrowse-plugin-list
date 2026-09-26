import { walkHighlight } from './walkHighlight'
import { parseGFA } from '../gfa-core/index'
import { convertGFAToGraph } from './gfa/gfaConverter'
import { anchorGraph } from './pathAnchoring'

// ref walks v1 v2 v3; alt walks v1 a1 v3, taking a1 in place of v2. The a1->v3
// link is written the other way round in the file, so the walk's step has to
// find it against the edge's direction.
const GFA = `S\tv1\tAAAA
S\tv2\tCC
S\tv3\tGGG
S\ta1\tTTTTTT
L\tv1\t+\tv2\t+\t0M
L\tv2\t+\tv3\t+\t0M
L\tv1\t+\ta1\t+\t0M
L\tv3\t-\ta1\t-\t0M
W\tref\t0\tchr\t0\t9\t>v1>v2>v3
W\talt\t1\tchr\t0\t13\t>v1>a1>v3`

const graph = anchorGraph(convertGFAToGraph(parseGFA(GFA)), 'ref')

test('a walk lifts its nodes, its links either way round, and its bp', () => {
  const h = walkHighlight(graph, 'alt#1#chr')!
  expect([...h.nodeIds]).toEqual(['v1+', 'a1+', 'v3+'])
  expect([...h.edgeIndexes].sort()).toEqual([2, 3])
  expect(h).toMatchObject({ steps: 3, bp: 13, referenceBp: 9 })
})

test('the reference walk compares to nothing, and a stranger is undefined', () => {
  expect(walkHighlight(graph, 'ref#0#chr')!.referenceBp).toBeUndefined()
  expect(walkHighlight(graph, 'nobody')).toBeUndefined()
})

// `odgi extract` leaves the extracted range on each P record's name. The anchor
// name has it stripped, so the reference walk has to be found the same way.
const ODGI = `S\tv1\tAAAA
S\tv2\tCC
S\tv3\tGGG
S\ta1\tTTTTTT
L\tv1\t+\tv2\t+\t0M
L\tv2\t+\tv3\t+\t0M
L\tv1\t+\ta1\t+\t0M
L\ta1\t+\tv3\t+\t0M
P\tK12#1#chr:1000-1009\tv1+,v2+,v3+\t*
P\tSakai#1#chr:2000-2013\tv1+,a1+,v3+\t*`

test('a walk is measured against a reference path whose name carries a range', () => {
  const extracted = anchorGraph(convertGFAToGraph(parseGFA(ODGI)), 'K12')
  const h = walkHighlight(extracted, 'Sakai#1#chr:2000-2013')!
  expect(h).toMatchObject({ bp: 13, referenceBp: 9 })
  expect(
    walkHighlight(extracted, 'K12#1#chr:1000-1009')!.referenceBp,
  ).toBeUndefined()
})
