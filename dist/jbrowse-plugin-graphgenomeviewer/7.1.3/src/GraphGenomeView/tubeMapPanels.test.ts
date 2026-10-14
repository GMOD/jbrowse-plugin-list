import { convertGFAToGraph } from '@jbrowse/bandage-core/gfa/gfaConverter'
import { parseGFA } from '@jbrowse/bandage-core/gfa-core/index'
import { tubeMapReferenceLayout } from '@jbrowse/bandage-core/layout/tubeMapLayout'
import { anchorGraph } from '@jbrowse/bandage-core/pathAnchoring'

import {
  PANEL_GAP,
  boxOf,
  drawSqueezedLengths,
  graphOfPaths,
  memberAt,
  tubeMapPanelGroups,
  walksThrough,
  withTubeMapPanels,
} from './tubeMapPanels'

import type { TubeMapDrawing } from '@jbrowse/bandage-core/layout/tubeMapLayout'

// A carries an insertion on its first haplotype; B lacks segment 3
const GFA = [
  'S\t1\tACGTACGTAC',
  'S\t2\tGGGG',
  'S\t3\tTTTTTTTTTT',
  'S\t4\tCCCCCCCCCC',
  'L\t1\t+\t2\t+\t0M',
  'L\t2\t+\t3\t+\t0M',
  'L\t1\t+\t3\t+\t0M',
  'L\t3\t+\t4\t+\t0M',
  'L\t1\t+\t4\t+\t0M',
  'P\tref\t1+,3+,4+\t*',
  'P\tA#1#c\t1+,2+,3+,4+\t*',
  'P\tA#2#c\t1+,3+,4+\t*',
  'P\tB#1#c\t1+,4+\t*',
].join('\n')

function graph() {
  return anchorGraph(convertGFAToGraph(parseGFA(GFA)), 'ref')
}

test('a panel per sample holds its haplotypes, per walk each walk alone', () => {
  const g = graph()
  expect(tubeMapPanelGroups(g, { by: 'sample' })).toEqual([
    { key: 'A', paths: ['A#1#c', 'A#2#c'] },
    { key: 'B', paths: ['B#1#c'] },
  ])
  expect(tubeMapPanelGroups(g, { by: 'walk' }).map(p => p.key)).toEqual([
    'A#1#c',
    'A#2#c',
    'B#1#c',
  ])
  expect(
    tubeMapPanelGroups(g, { by: 'sample', domain: ['B'] }).map(p => p.key),
  ).toEqual(['B', 'A'])
})

// a haplotype's own row wins over its sample's; a sample in no row goes last
test('a column groups samples by their value, named with how many', () => {
  const table = [
    { name: 'A', pop: 'EUR' },
    { name: 'A#2', pop: 'AFR' },
  ]
  expect(
    tubeMapPanelGroups(graph(), { by: 'column', field: 'pop', table }),
  ).toEqual([
    { key: 'AFR', paths: ['A#2#c'], label: 'AFR · 1 sample' },
    { key: 'EUR', paths: ['A#1#c'], label: 'EUR · 1 sample' },
    { key: '', paths: ['B#1#c'], label: 'pop: none · 1 sample' },
  ])
})

test("a panel's graph is the reference and its walks, and what they visit", () => {
  const b = graphOfPaths(graph(), ['B#1#c'])
  expect(b.paths!.map(p => p.name)).toEqual(['ref', 'B#1#c'])
  expect(b.nodes.map(n => n.name).sort()).toEqual(['1', '3', '4'])
  expect(b.edges.every(e => e.from !== '2+' && e.to !== '2+')).toBe(true)
  for (const visits of b.pathVisits!.values()) {
    expect(visits.every(v => v.path === 'ref' || v.path === 'B#1#c')).toBe(true)
  }
})

test('panels stack down the pane, a title gap above each', () => {
  const g = graph()
  const whole = tubeMapReferenceLayout(g)!
  const laidOut = tubeMapPanelGroups(g, { by: 'sample' }).map(group => ({
    ...group,
    result: tubeMapReferenceLayout(graphOfPaths(g, group.paths)),
  }))
  const split = withTubeMapPanels(whole, laidOut)
  const [a, b] = split.tubeMapPanels!
  expect(a!.top).toBe(PANEL_GAP)
  expect(b!.top).toBe(a!.top + a!.height + PANEL_GAP)
  expect(split.extent).toMatchObject({ minY: 0, maxY: b!.top + b!.height })
  expect(a!.result.tubeMap.layout.tracks).toHaveLength(3)
  expect(b!.result.tubeMap.layout.tracks).toHaveLength(2)
  const ys = Object.values(split.nodePositions).flatMap(s => s.map(p => p.y))
  expect(Math.min(...ys)).toBeGreaterThanOrEqual(PANEL_GAP)
  expect(Math.max(...ys)).toBeLessThanOrEqual(split.extent!.maxY!)
})

test('one group draws the whole map, unsplit', () => {
  const g = graph()
  const whole = tubeMapReferenceLayout(g)!
  const split = withTubeMapPanels(whole, [
    {
      key: 'B',
      paths: ['B#1#c'],
      result: tubeMapReferenceLayout(graphOfPaths(g, ['B#1#c'])),
    },
  ])
  expect(split).toBe(whole)
})

// A's first haplotype carries the insertion its second does not; B never
// visits it
test("a hovered node's box in each panel, and how many walks pass it", () => {
  const g = graph()
  const a = tubeMapReferenceLayout(graphOfPaths(g, ['A#1#c', 'A#2#c']))!
  expect(boxOf(a.tubeMap!, '2+')).toBe('2+')
  expect(walksThrough(a.tubeMap!.graph, '2+')).toEqual({ here: 1, of: 2 })
  const b = tubeMapReferenceLayout(graphOfPaths(g, ['B#1#c']))!
  expect(boxOf(b.tubeMap!, '2+')).toBeUndefined()
  const box = boxOf(b.tubeMap!, '3+')!
  expect(box).toBeDefined()
  expect(walksThrough(b.tubeMap!.graph, box)).toEqual({ here: 0, of: 1 })
})

test("a merged run's member is the one under the pointer's share of its width", () => {
  const spans: Record<string, { start: number; end: number }> = {
    left: { start: 100, end: 200 },
    deleted: { start: 200, end: 1000 },
    right: { start: 1000, end: 1100 },
  }
  const members = ['left', 'deleted', 'right']
  const at = (sx: number) => memberAt(members, id => spans[id], 0, 100, sx)
  expect(at(1)).toBe('left')
  expect(at(50)).toBe('deleted')
  expect(at(99)).toBe('right')
  expect(at(-20)).toBe('left')
  expect(at(140)).toBe('right')
  expect(memberAt(members, () => undefined, 0, 100, 50)).toBeUndefined()
})

test('squeezed boxes of one length in a column share a label at the lowest', () => {
  const box = (name: string, x: number, y: number, pixelWidth = 4) => ({
    name,
    x,
    y,
    pixelWidth,
    contentHeight: 8,
    order: 1,
  })
  // sparse, as the layout's are: index 1 is a hole
  const nodes: ReturnType<typeof box>[] = []
  nodes[0] = box('a', 10, 20)
  nodes[2] = box('b', 10, 40)
  nodes[3] = box('snp', 10, 60)
  nodes[4] = box('ref', 100, 0, 400)
  nodes[5] = box('lone', 300, 80)
  const drawing = {
    columns: [],
    graph: {
      nodes: [
        { id: 'a', length: 32_738 },
        { id: 'b', length: 32_738 },
        { id: 'snp', length: 1 },
        { id: 'ref', length: 40_000 },
        { id: 'lone', length: 6_367 },
      ],
    },
    layout: { nodes },
  } as unknown as TubeMapDrawing
  const written: [string, number][] = []
  const ctx = {
    measureText: (text: string) => ({ width: text.length * 6 }),
    fillText: (text: string, _x: number, y: number) => written.push([text, y]),
    strokeText: () => {},
  } as unknown as CanvasRenderingContext2D
  drawSqueezedLengths(ctx, drawing, {
    x: (tx: number) => tx,
    y: (ty: number) => ty,
    width: 1000,
  } as never)
  expect(written).toEqual([
    ['32.7 kb each', 44],
    ['6.4 kb', 84],
  ])
})
