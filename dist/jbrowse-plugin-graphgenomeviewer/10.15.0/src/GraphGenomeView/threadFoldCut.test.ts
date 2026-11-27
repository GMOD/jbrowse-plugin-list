import { foldVariants } from '@jbrowse/bandage-core/foldVariants'
import { clipToWindow } from '@jbrowse/bandage-core/layout/trimToWindow'
import { loadGraph } from '@jbrowse/bandage-core/pipeline'
import { threadLayers } from '@jbrowse/bandage-core/threadFold'
import { walkLift } from '@jbrowse/bandage-core/walkHighlight'
import { expect, test } from 'vitest'

import { THREAD_FOLD_MIN_BP, foldedCut } from './threadFoldCut'

// The reference walks a s b c. HG1 takes t for s, a 1 bp difference; HG2 and
// HG3 skip b's 2 kb, one through s and one through t.
const SEGMENTS = `S\ta\t*\tLN:i:1000\tSN:Z:chr1\tSO:i:0\tSR:i:0
S\ts\t*\tLN:i:1\tSN:Z:chr1\tSO:i:1000\tSR:i:0
S\tt\t*\tLN:i:1\tSN:Z:HG1#1#chr1\tSO:i:1000\tSR:i:1
S\tb\t*\tLN:i:2000\tSN:Z:chr1\tSO:i:1001\tSR:i:0
S\tc\t*\tLN:i:1000\tSN:Z:chr1\tSO:i:3001\tSR:i:0
L\ta\t+\ts\t+\t0M
L\ta\t+\tt\t+\t0M
L\ts\t+\tb\t+\t0M
L\tt\t+\tb\t+\t0M
L\tb\t+\tc\t+\t0M
L\ts\t+\tc\t+\t0M
L\tt\t+\tc\t+\t0M`

const WALKS = `W\tGRCh38\t0\tchr1\t0\t4001\t>a>s>b>c
W\tHG1\t1\tchr1\t0\t4001\t>a>t>b>c
W\tHG2\t1\tchr1\t0\t2001\t>a>s>c
W\tHG3\t2\tchr1\t0\t2001\t>a>t>c`

const walked = (walks = WALKS) =>
  loadGraph(`${SEGMENTS}\n${walks}`, 'toy', { referencePath: 'GRCh38#0#chr1' })

test('a graph with walks folds to threads, each with its count, at the view’s fold', () => {
  const graph = walked()
  const cut = foldedCut(graph, 500)
  expect(cut.foldedBelowBp).toBe(500)
  expect(cut.foldRefusal).toBeUndefined()
  expect(cut.graph.nodes.map(n => [n.name, n.length, n.stable?.start])).toEqual(
    [
      ['a', 1000, 0],
      ['s~b', 2001, 1000],
      ['c', 1000, 3001],
    ],
  )
  expect(cut.graph.nodes.every(n => n.stable?.refName === 'chr1')).toBe(true)
  expect(
    cut.graph.paths!.map(p => [p.name, p.count, p.nodeIds.join(' ')]),
  ).toEqual([
    ['GRCh38#0#chr1', 1, 'a+ s~b+ c+'],
    ['HG1#1#chr1', 1, 'a+ s~b+ c+'],
    ['HG2#1#chr1', 2, 'a+ c+'],
  ])
  expect(cut.graph.threadFold).toEqual({
    belowBp: 500,
    haplotypes: 4,
    walks: 4,
    stepless: 0,
    departing: [],
  })
  expect(cut.unfoldedGraph).toBe(graph)
  expect(
    cut.threadEvents!.map(e => [e.kind, e.haplotypes, e.from, e.to]),
  ).toEqual([['deletion', 2, 'a+', 'c+']])
})

test('a fold to threads is not clipped to the window, as a graph with walks never was', () => {
  const cut = foldedCut(walked(), 500, { region: { start: 1500, end: 2500 } })
  expect(cut.graph.nodes.map(n => n.length)).toEqual([1000, 2001, 1000])
})

test('under the size walks fold from, and on a layout that draws each walk, the graph comes back whole', () => {
  const graph = walked()
  expect(foldedCut(graph, THREAD_FOLD_MIN_BP - 1)).toEqual({
    graph,
    foldedBelowBp: undefined,
    foldRefusal: undefined,
    threadEvents: undefined,
    unfoldedGraph: undefined,
  })
  expect(foldedCut(graph, 500, { threads: false }).graph).toBe(graph)
  expect(foldedCut(graph, 0).graph).toBe(graph)
})

test('a cut graph-fold refuses is drawn whole, with the reason for the legend', () => {
  const graph = walked(
    WALKS.replace('>a>s>b>c\n', '>a>s>b>c>b\n') + '\nL\tc\t+\tb\t+\t0M',
  )
  const cut = foldedCut(graph, 500)
  expect(cut.graph).toBe(graph)
  expect(cut.foldedBelowBp).toBeUndefined()
  expect(cut.threadEvents).toBeUndefined()
  expect(cut.foldRefusal).toMatch(/reference/)
  expect(cut.unfoldedGraph).toBeUndefined()
})

test('a walk with no steps here is left out of the threads and counted, and walks with none at all are not folded', () => {
  const graph = walked()
  const stub = {
    ...graph,
    paths: graph.paths!.map((path, i) =>
      i === 3 ? { ...path, nodeIds: [] } : path,
    ),
  }
  const cut = foldedCut(stub, 500)
  expect(cut.graph.threadFold).toMatchObject({ walks: 3, stepless: 1 })
  expect(cut.graph.paths!.flatMap(p => p.members)).not.toContain('HG3#2#chr1')
  const none = {
    ...graph,
    paths: graph.paths!.map(p => ({ ...p, nodeIds: [] })),
  }
  expect(foldedCut(none, 500)).toMatchObject({
    graph: none,
    foldRefusal: undefined,
  })
})

test('a graph without walks folds its small alleles and is clipped, as before', () => {
  const plain = loadGraph(SEGMENTS, 'toy')
  const region = { start: 0, end: 4001 }
  const cut = foldedCut(plain, 500, { region })
  expect(cut).toEqual({
    graph: clipToWindow(foldVariants(plain, 500, { cut: true }), region, 500),
    foldedBelowBp: 500,
    foldRefusal: undefined,
    threadEvents: undefined,
    unfoldedGraph: undefined,
  })
})

test('picking a haplotype lights the thread that holds it, once however many of its walks are picked', () => {
  const { graph } = foldedCut(walked(), 500)
  const layers = threadLayers(graph, [
    { walk: 'HG3#2#chr1' },
    { walk: 'HG2#1#chr1' },
    { walk: 'HG1#1#chr1' },
  ])
  expect(layers).toEqual([
    { walk: 'HG2#1#chr1', picked: ['HG3#2#chr1', 'HG2#1#chr1'] },
    { walk: 'HG1#1#chr1', picked: ['HG1#1#chr1'] },
  ])
  const lift = walkLift(graph, layers)!
  expect(
    lift.walks.map(w => [w.name, w.count, [...w.nodeIds].join(' ')]),
  ).toEqual([
    ['HG2#1#chr1', 2, 'a+ c+'],
    ['HG1#1#chr1', 1, 'a+ s~b+ c+'],
  ])
  expect(lift.walks[0]!.members).toEqual(['HG2#1#chr1', 'HG3#2#chr1'])
  expect(lift.walks[0]!.variation).toBe(
    '2 haplotypes, 1 bp folded away in each',
  )
})

test('a pick on a graph that was not folded is lifted as it was', () => {
  const graph = walked()
  const layers = [{ walk: 'HG3#2#chr1' }]
  expect(threadLayers(graph, layers)).toEqual(layers)
  expect(walkLift(graph, layers)!.walks[0]!.count).toBeUndefined()
})

test('a haplotype in two pieces counts once, and picking it lights each thread a piece took', () => {
  const { graph, threadEvents } = foldedCut(
    walked(
      `${WALKS}\nW\tHG4\t1\tchr1\t0\t1000\t>a\nW\tHG4\t1\tchr1\t5000\t7001\t>a>s>c`,
    ),
    500,
  )
  expect(graph.threadFold).toMatchObject({ haplotypes: 5, walks: 6 })
  const skipping = graph.paths!.find(p => p.name === 'HG2#1#chr1')!
  expect(skipping.count).toBe(3)
  expect(threadEvents!.find(e => e.kind === 'deletion')!.text).toMatch(
    /, 3 of 5$/,
  )
  expect(
    threadLayers(graph, [{ walk: 'HG4#1#chr1' }]).map(l => l.walk),
  ).toEqual(['HG2#1#chr1', 'HG4#1#chr1 piece 1'])
})
