import { serializeEl } from '@jbrowse/bandage-core/el'
import { parseSamplesTsv } from '@jbrowse/core/util/samplesTsv'

import {
  SECTION_HEADER_PX,
  groupByOf,
  groupWalkRows,
  metadataColumns,
  sectionIndexOf,
  sectionPlacement,
  walkRowTrees,
  walkRowTreesPanKey,
} from './walkRowGroups'

import type { WalkRowSection } from './walkRowGroups'
import type { El } from '@jbrowse/bandage-core/el'
import type { WalkRow } from '@jbrowse/bandage-core/layout/walkRows'

const TSV = [
  'name\tpopulation\tsuperpopulation',
  'GRCh38\t\t',
  'A\tYRI\tAFR',
  'B\tGBR\tEUR',
  'A\tCEU\tEUR',
  'C#1\tMXL',
  '',
].join('\r\n')

test('a samples TSV keys rows by its first column, the first of a repeat kept', () => {
  const rows = parseSamplesTsv(
    TSV,
    undefined,
    'samples.tsv',
    'the walks',
  ).sources
  expect(rows.map(r => r.name)).toEqual(['GRCh38', 'A', 'B', 'C#1'])
  expect(rows[1]).toEqual({
    name: 'A',
    population: 'YRI',
    superpopulation: 'AFR',
  })
  expect(rows[3]!.superpopulation).toBe('')
  expect(metadataColumns(rows)).toEqual(['population', 'superpopulation'])
  expect(metadataColumns(undefined)).toEqual([])
})

test('the persisted setting reads a bare field or the object, anything else as ungrouped', () => {
  expect(groupByOf('superpopulation')).toEqual({ field: 'superpopulation' })
  expect(groupByOf({ field: 'sex', sort: ['male', 3] })).toEqual({
    field: 'sex',
    sort: ['male'],
  })
  expect(groupByOf({ field: 'sex', domain: ['female'] })).toEqual({
    field: 'sex',
    sort: ['female'],
  })
  expect(groupByOf('')).toBeUndefined()
  expect(groupByOf({ field: 3 })).toBeUndefined()
  expect(groupByOf(42)).toBeUndefined()
  expect(groupByOf(undefined)).toBeUndefined()
})

describe('grouping', () => {
  const table = parseSamplesTsv(
    TSV,
    undefined,
    'samples.tsv',
    'the walks',
  ).sources
  const rows = [
    { sample: 'B', label: 'B#1' },
    { sample: 'D', label: 'D#1' },
    { sample: 'A', label: 'A#2' },
    { sample: 'C', label: 'C#1' },
    { sample: 'A', label: 'A#1' },
  ]

  test('sections sort by key, keep the row order, and rows with no value go last', () => {
    const { rows: ordered, sections } = groupWalkRows(rows, table, {
      field: 'superpopulation',
    })
    expect(sections).toEqual([
      { key: 'AFR', title: 'AFR · 2 haplotypes', first: 1, count: 2 },
      { key: 'EUR', title: 'EUR · 1 haplotype', first: 3, count: 1 },
      {
        key: '',
        title: 'superpopulation: none · 2 haplotypes',
        first: 4,
        count: 2,
      },
    ])
    expect(ordered.map(r => r.label)).toEqual([
      'A#2',
      'A#1',
      'B#1',
      'D#1',
      'C#1',
    ])
  })

  test('a haplotype row in the table wins over its sample, and a sort leads the order', () => {
    const { rows: ordered, sections } = groupWalkRows(rows, table, {
      field: 'population',
      sort: ['MXL'],
    })
    expect(sections.map(s => s.key)).toEqual(['MXL', 'GBR', 'YRI', ''])
    expect(ordered[0]!.label).toBe('C#1')
  })
})

test('one row pitch across sections, a header strip above each', () => {
  const sections = [
    { key: 'a', title: 'a', first: 1, count: 2 },
    { key: 'b', title: 'b', first: 3, count: 3 },
  ]
  const place = sectionPlacement(sections, 4)
  const H = SECTION_HEADER_PX
  expect([0, 1, 2, 3, 4, 5].map(place.rowY)).toEqual([
    0,
    4 + H,
    8 + H,
    12 + 2 * H,
    16 + 2 * H,
    20 + 2 * H,
  ])
  expect(place.headers.map(h => h.top)).toEqual([2, 10 + H])
  expect(place.headersPx).toBe(2 * H)
  for (let i = 0; i < 6; i++) {
    expect(place.rowAt(place.rowY(i) + 1, 6)).toBe(i)
  }
  // a point in a header strip names the nearest row beside it
  expect(place.rowAt(place.headers[1]!.top + 2, 6)).toBe(2)
  const flat = sectionPlacement([], 4)
  expect(flat.rowY(3)).toBe(12)
  expect(flat.rowAt(13, 6)).toBe(3)
  expect(flat.headersPx).toBe(0)
})

test('each section is a block of rows one pitch apart, under the reference row', () => {
  const sections = [
    { key: 'a', title: 'a', first: 1, count: 2 },
    { key: 'b', title: 'b', first: 3, count: 3 },
  ]
  const place = sectionPlacement(sections, 4)
  expect(place.blocks(6)).toEqual([
    { first: 0, count: 1, rowY: 0 },
    { first: 1, count: 2, rowY: place.rowY(1) },
    { first: 3, count: 3, rowY: place.rowY(3) },
  ])
  expect(sectionPlacement([], 4).blocks(6)).toEqual([
    { first: 0, count: 6, rowY: 0 },
  ])
  expect([0, 1, 2, 3, 5].map(i => sectionIndexOf(sections, i))).toEqual([
    -1, 0, 0, 1, 1,
  ])
})

test('a point past either end names the end row, and a tie the upper row', () => {
  const place = sectionPlacement([], 4)
  expect(place.rowAt(-50, 6)).toBe(0)
  expect(place.rowAt(500, 6)).toBe(5)
  expect(place.rowAt(6, 6)).toBe(1)
  expect(place.rowAt(0, 0)).toBe(0)
})

describe('panning the trees', () => {
  function row(name: string, bp: number): WalkRow {
    return {
      name,
      label: name,
      sample: name,
      bp,
      offReferenceBp: 0,
      gapBp: 0,
      complete: true,
      runs: [
        { start: 0, bp: bp / 2, onReference: true, referenceStart: 1000 },
        { start: bp / 2, bp: bp / 2, onReference: false },
      ],
    }
  }
  const bars = {
    origin: 1000,
    unit: 100,
    reference: row('GRCh38', 3000),
    rows: ['A', 'B', 'C', 'D', 'E'].map((name, i) => row(name, 1000 + 400 * i)),
  }
  const sections: WalkRowSection[] = [
    { key: 'AFR', title: 'AFR', first: 1, count: 3 },
    { key: 'EUR', title: 'EUR', first: 4, count: 2 },
  ]
  const pitch = { rowPx: 14, barPx: 8, readouts: true }

  // each x and y moved back by the pan, to the hundredth of a px
  function unpanned(node: El | string, dx: number, dy: number): El | string {
    const back = (name: string, value: string | number | undefined) =>
      typeof value !== 'number'
        ? value
        : /^x[12]?$/.test(name)
          ? (value - dx).toFixed(2)
          : /^y[12]?$/.test(name)
            ? (value - dy).toFixed(2)
            : value
    return typeof node === 'string'
      ? node
      : {
          ...node,
          attrs: Object.fromEntries(
            Object.entries(node.attrs).map(([name, value]) => [
              name,
              back(name, value),
            ]),
          ),
          children: node.children.map(c => unpanned(c, dx, dy)),
        }
  }

  // whether each pan kept the key of the last redraw, and whether drawing
  // afresh matched that redraw moved by the pan
  function pansThrough(groups: WalkRowSection[]) {
    const place = sectionPlacement(groups, pitch.rowPx)
    const frameAt = ([translateX, translateY]: [number, number]) => ({
      scaleX: 0.1,
      scaleY: 1,
      translateX,
      translateY,
      width: 400,
      height: 60,
      ...pitch,
    })
    const keyAt = (at: [number, number]) =>
      walkRowTreesPanKey(bars, place.rowY, frameAt(at))
    const drawnAt = (at: [number, number]) =>
      walkRowTrees(bars, groups, place.rowY, frameAt(at), {
        idPrefix: 't',
      }).map(tree => serializeEl(unpanned(tree, at[0], at[1])))
    let redrawnAt: [number, number] = [-40, 30]
    return Array.from({ length: 60 }, (_, k) => {
      const at: [number, number] = [-40 + 9 * k, 30 - 3 * k]
      const kept = keyAt(at) === keyAt(redrawnAt)
      const moved =
        JSON.stringify(drawnAt(at)) === JSON.stringify(drawnAt(redrawnAt))
      redrawnAt = kept ? redrawnAt : at
      return { kept, moved }
    })
  }

  test.each([
    ['ungrouped', []],
    ['grouped', sections],
  ])(
    '%s, a pan keeps the key exactly when it only moves the trees',
    (_, groups) => {
      const pans = pansThrough(groups)
      expect(pans.filter(p => p.kept !== p.moved)).toEqual([])
      expect(pans.filter(p => !p.kept).length).toBeGreaterThan(3)
      expect(pans.filter(p => p.kept).length).toBeGreaterThan(pans.length / 2)
    },
  )
})
