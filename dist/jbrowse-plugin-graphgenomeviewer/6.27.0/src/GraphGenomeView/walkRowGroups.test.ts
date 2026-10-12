import {
  SECTION_HEADER_PX,
  groupByOf,
  groupWalkRows,
  metadataColumns,
  parseSamplesTsv,
  sectionPlacement,
} from './walkRowGroups'

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
  const rows = parseSamplesTsv(TSV)
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
  expect(groupByOf({ field: 'sex', domain: ['male', 3] })).toEqual({
    field: 'sex',
    domain: ['male'],
  })
  expect(groupByOf('')).toBeUndefined()
  expect(groupByOf({ field: 3 })).toBeUndefined()
  expect(groupByOf(42)).toBeUndefined()
  expect(groupByOf(undefined)).toBeUndefined()
})

describe('grouping', () => {
  const table = parseSamplesTsv(TSV)
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

  test('a haplotype row in the table wins over its sample, and a domain leads the order', () => {
    const { rows: ordered, sections } = groupWalkRows(rows, table, {
      field: 'population',
      domain: ['MXL'],
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
