import { convertGFAToGraph } from '@jbrowse/bandage-core/gfa/gfaConverter'
import { parseGFA } from '@jbrowse/bandage-core/gfa-core/index'
import { tubeMapReferenceLayout } from '@jbrowse/bandage-core/layout/tubeMapLayout'
import { anchorGraph } from '@jbrowse/bandage-core/pathAnchoring'

import {
  PANEL_GAP,
  boxOf,
  graphOfPaths,
  tubeMapPanelGroups,
  walksThrough,
  withTubeMapPanels,
} from './tubeMapPanels'

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
