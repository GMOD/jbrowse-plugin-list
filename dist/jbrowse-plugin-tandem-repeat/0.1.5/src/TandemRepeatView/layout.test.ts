import {
  SECTION_HEADER_PX,
  axisTicks,
  copiesOf,
  facetSections,
  formatBp,
  readout,
  rowLayout,
  squeezedOrder,
  unitLabel,
} from './layout'

const units = [{ length: 5548, copies: 7 }]

test('RUB places each copy; without it a whole count splits its run evenly', () => {
  expect(
    copiesOf(
      {
        label: 'a',
        bp: 30,
        runs: [{ unit: 0, count: 3, bp: 30, copyBp: [9, 11, 10] }],
      },
      units,
    ),
  ).toEqual([
    { start: 0, bp: 9, unit: 0 },
    { start: 9, bp: 11, unit: 0 },
    { start: 20, bp: 10, unit: 0 },
  ])
  expect(
    copiesOf(
      { label: 'a', bp: 30, runs: [{ unit: 0, count: 2, bp: 30 }] },
      units,
    ),
  ).toEqual([
    { start: 0, bp: 15, unit: 0 },
    { start: 15, bp: 15, unit: 0 },
  ])
})

test('a fractional count takes whole units and the remainder last', () => {
  const copies = copiesOf(
    { label: 'a', bp: 8322, runs: [{ unit: 0, count: 1.5, bp: 8322 }] },
    units,
  )
  expect(copies.map(c => c.bp)).toEqual([5548, 2774])
})

test('the readout counts copies, or units for the reference allele', () => {
  const runs = [{ unit: 0, count: 27, bp: 147189 }]
  expect(readout({ label: 'a', bp: 147189, runs }, 30751, 5548)).toBe(
    '147 kb · 27 copies (+116 kb)',
  )
  expect(readout({ label: 'GRCh38', bp: 387 }, 400, 10)).toBe(
    '387 bp ≈ 39 units (−13 bp)',
  )
  expect(formatBp(5547)).toBe('5.5 kb')
})

test('ruler ticks step by 1, 2 or 5 times a power of ten', () => {
  expect(axisTicks(147189)).toEqual([0, 50000, 100000])
  expect(axisTicks(3161)).toEqual([0, 1000, 2000, 3000])
  expect(axisTicks(0)).toEqual([0])
})

test('rows past the height budget squash into it, unlabelled below a label', () => {
  expect(rowLayout(9)).toEqual({ rowPx: 22, barPx: 12, labelled: true })
  const cohort = rowLayout(464)
  expect(cohort.rowPx * 464).toBeCloseTo(rowLayout(30).rowPx * 30)
  expect(cohort.rowPx).toBeLessThan(2)
  expect(cohort).toMatchObject({ barPx: cohort.rowPx, labelled: false })
  expect(rowLayout(40).labelled).toBe(true)
})

test('squeezed rows gather the rarest unit, then run longest first', () => {
  const two = [
    { length: 5536, copies: 20 },
    { length: 5559, copies: 3 },
  ]
  const allele = (label: string, bp: number, rare: number) => ({
    label,
    bp,
    runs: [
      ...(rare ? [{ unit: 1, count: rare, bp: rare * 5559 }] : []),
      { unit: 0, count: 2, bp: bp - rare * 5559 },
    ],
  })
  const { rows, rule } = squeezedOrder(
    [
      allele('none', 90_000, 0),
      allele('one', 30_000, 1),
      allele('two', 20_000, 2),
    ],
    two,
  )
  expect(rows.map(r => r.label)).toEqual(['two', 'one', 'none'])
  expect(rule).toBe('most unit 2 first, then longest')
  expect(squeezedOrder(rows, [two[0]!]).rule).toBe('longest first')
  expect(squeezedOrder(rows, [two[0]!]).rows.map(r => r.label)).toEqual([
    'none',
    'one',
    'two',
  ])
})

test('a named unit labels itself; an unnamed one by its rank', () => {
  const units = [
    { length: 5536, copies: 9, name: 'KIV-2A' },
    { length: 5559, copies: 1 },
  ]
  expect(unitLabel(units, 0)).toBe('KIV-2A')
  expect(unitLabel(units, 1)).toBe('unit 2')
  expect(
    squeezedOrder([], [units[0]!, { ...units[1]!, name: 'KIV-2B' }]).rule,
  ).toBe('most KIV-2B first, then longest')
})

describe('facet sections', () => {
  const two = [
    { length: 5536, copies: 20, name: 'KIV-2A' },
    { length: 5559, copies: 3, name: 'KIV-2B' },
  ]
  const allele = (sample: string | undefined, bp: number, b: number) => ({
    label: `${sample}#1`,
    ...(sample ? { sample } : {}),
    bp,
    runs: [
      ...(b ? [{ unit: 1, count: b, bp: b * 5559 }] : []),
      { unit: 0, count: 2, bp: bp - b * 5559 },
    ],
  })
  const samples = [
    { name: 'EUR1', superpopulation: 'EUR' },
    { name: 'EUR2', superpopulation: 'EUR' },
    { name: 'AFR1', superpopulation: 'AFR' },
    { name: 'BLANK', superpopulation: '' },
  ]
  const cohort = [
    ...Array.from({ length: 60 }, (_, i) => allele('EUR1', 50_000 + i, 0)),
    allele('EUR2', 30_000, 1),
    allele('AFR1', 20_000, 0),
    allele('AFR1', 40_000, 2),
    allele('UNLISTED', 60_000, 0),
    allele('BLANK', 60_000, 0),
    allele(undefined, 60_000, 0),
    ...Array.from({ length: 10 }, (_, i) => allele('AFR1', 10_000 + i, 0)),
  ]

  test('sections stack sorted, the rows with no value last', () => {
    const { sections } = facetSections(cohort, two, samples, {
      field: 'superpopulation',
    })
    expect(sections.map(s => s.title)).toEqual([
      'AFR · 12 haplotypes',
      'EUR · 61 haplotypes',
      'superpopulation: none · 3 haplotypes',
    ])
    expect(sections.at(-1)!.key).toBe('')
    expect(
      facetSections(cohort, two, samples, {
        field: 'superpopulation',
        domain: ['EUR'],
      }).sections.map(s => s.key),
    ).toEqual(['EUR', 'AFR', ''])
  })

  test('every section shares one row pitch, so heights follow row counts', () => {
    const { rowPx, sections, rowsPx } = facetSections(cohort, two, samples, {
      field: 'superpopulation',
    })
    expect(rowPx).toBe(rowLayout(cohort.length).rowPx)
    expect(sections.map(s => s.top)).toEqual([
      0,
      SECTION_HEADER_PX + 12 * rowPx,
      2 * SECTION_HEADER_PX + 73 * rowPx,
    ])
    expect(rowsPx).toBeCloseTo(3 * SECTION_HEADER_PX + cohort.length * rowPx)
  })

  test('squeezed rows sort by the rule within each section', () => {
    const { sections, rule } = facetSections(cohort, two, samples, {
      field: 'superpopulation',
    })
    expect(rule).toBe(
      'grouped by superpopulation, within each most KIV-2B first, then longest',
    )
    expect(sections[0]!.rows.slice(0, 3).map(r => r.bp)).toEqual([
      40_000, 20_000, 10_009,
    ])
    expect(sections[1]!.rows[0]!.sample).toBe('EUR2')
  })

  test('labelled rows keep their order, and no facet makes one headerless section', () => {
    const few = cohort.slice(60, 66)
    const { sections, rule, labelled } = facetSections(few, two, samples, {
      field: 'superpopulation',
    })
    expect(labelled).toBe(true)
    expect(rule).toBe('grouped by superpopulation')
    expect(sections[0]!.rows.map(r => r.bp)).toEqual([20_000, 40_000])
    expect(facetSections(few, two, samples, undefined)).toMatchObject({
      rule: undefined,
      sections: [{ key: '', title: '', top: 0, rows: few }],
    })
  })
})
