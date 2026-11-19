import {
  routesNote,
  routesToLoad,
  tubeMapNote,
  tubeMapWalksToLoad,
} from './unloadedWalks'
import { EXPAND_NAMED_MAX } from '../GetSubgraph'

import type { WalkRow } from '@jbrowse/bandage-core/layout/walkRows'
import type { Graph } from '@jbrowse/bandage-core/types'

const rowOf = (name: string, unloadedBp?: number): WalkRow => ({
  name,
  label: name,
  sample: name,
  bp: 1000,
  offReferenceBp: 0,
  gapBp: 0,
  complete: true,
  runs: [],
  ...(unloadedBp === undefined ? {} : { unloadedBp, abridgedSteps: 40 }),
})

const rows = (n: number) =>
  Array.from({ length: n }, (_, i) => rowOf(`S${i}#1#c`, 500))

test('a few compared rows with steps not fetched are fetched whole, and the note says so', () => {
  const compared = [rowOf('A#1#c'), rowOf('B#1#c', 500), rowOf('C#1#c', 20)]
  expect(routesToLoad(compared)).toEqual(['B#1#c', 'C#1#c'])
  expect(routesNote(compared)).toBe('Fetching node-level detail for 2 rows')
  expect(routesNote([rowOf('B#1#c', 500)])).toBe(
    'Fetching node-level detail for 1 row',
  )
})

test('as many as the limit are still fetched whole', () => {
  expect(routesToLoad(rows(EXPAND_NAMED_MAX))).toHaveLength(EXPAND_NAMED_MAX)
  expect(routesNote(rows(EXPAND_NAMED_MAX))).toBe(
    `Fetching node-level detail for ${EXPAND_NAMED_MAX} rows`,
  )
})

test('more than that are left out, and the note says how many and why', () => {
  const many = rows(EXPAND_NAMED_MAX + 1)
  expect(routesToLoad(many)).toEqual([])
  expect(routesNote(many)).toBe(
    `Leaves out ${EXPAND_NAMED_MAX + 1} rows: node-level detail is fetched for at most ${EXPAND_NAMED_MAX} at a time. Choose up to ${EXPAND_NAMED_MAX} samples under Samples to include them.`,
  )
})

test('rows with every step fetched need nothing', () => {
  expect(routesToLoad([rowOf('A#1#c')])).toEqual([])
  expect(routesNote([rowOf('A#1#c')])).toBeUndefined()
})

// a graph of `n` haplotypes' walks, the first stepping through a placeholder,
// which the cut's abridged list names
function graphOf(n: number): Graph {
  return {
    name: 'g',
    nodes: [
      { id: 's1', name: 's1', length: 10, depth: 1 },
      { id: 'p', name: 'p', length: 300, depth: 1, placeholder: true },
    ],
    edges: [],
    paths: Array.from({ length: n }, (_, i) => ({
      name: `S${i}#1#c`,
      sample: `S${i}`,
      haplotype: 1,
      nodeIds: i === 0 ? ['s1', 'p'] : ['s1'],
    })),
  }
}

const abridged = [{ name: 'S0#1#c', bp: 300 }]

test('a tube map fetches the nodes of the walks it shows, up to the limit', () => {
  expect(tubeMapWalksToLoad(graphOf(EXPAND_NAMED_MAX), abridged)).toEqual([
    'S0#1#c',
  ])
  expect(tubeMapWalksToLoad(graphOf(EXPAND_NAMED_MAX + 1), abridged)).toEqual(
    [],
  )
})

test('a tube map says why its boxes stay unfilled only past the limit', () => {
  expect(tubeMapNote(graphOf(EXPAND_NAMED_MAX), abridged)).toBeUndefined()
  expect(tubeMapNote(graphOf(EXPAND_NAMED_MAX + 1), [])).toBeUndefined()
  expect(tubeMapNote(graphOf(EXPAND_NAMED_MAX + 1), abridged)).toBe(
    `Node-level detail is fetched for at most ${EXPAND_NAMED_MAX} haplotypes at a time. Choose ${EXPAND_NAMED_MAX} or fewer under Load in the track menu, or in Graph settings, to see it.`,
  )
})
