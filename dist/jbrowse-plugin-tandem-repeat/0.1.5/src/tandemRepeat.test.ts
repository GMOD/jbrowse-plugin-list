import { hasTandemAllele, mayStateRepeat, tandemRepeatOf } from './tandemRepeat'

const base = { refName: 'chr6', start: 160616002, end: 160616003 }

// Two copies of unit B then three of A, and a second allele of four A: RN
// splits the flattened lists 2 + 1, and RUB lists every copy of every run.
const A = 'ACGTACGTAC'
const B = 'ACGTTCGTAC'
const tandem = {
  ...base,
  name: 'KIV-2',
  ALT: ['<CNV:TR>', '<CNV:TR>'],
  INFO: {
    SVLEN: [30, 30],
    RN: [2, 1],
    RUS: [B, A, A],
    RUC: [2, 3, 4],
    RB: [20, 29, 40],
    RUB: [10, 10, 10, 10, 9, 10, 10, 10, 10],
  },
  samples: {
    HG00128: { GT: ['1|2'] },
    HG00133: { GT: ['.|1'] },
    GRCh38: { GT: ['0'] },
    HG00099: { GT: ['2/1'] },
  },
}

test("a <CNV:TR> record's alleles take their runs off RN, RUS, RUC, RB and RUB", () => {
  const repeat = tandemRepeatOf(tandem)!
  expect(repeat).toMatchObject({
    name: 'KIV-2',
    start: 160616003,
    end: 160616033,
    unitLength: 10,
  })
  expect(repeat.units).toEqual([
    { length: 10, copies: 7, sequence: A },
    { length: 10, copies: 2, sequence: B },
  ])
  const bThenA = [
    { unit: 1, count: 2, bp: 20, copyBp: [10, 10] },
    { unit: 0, count: 3, bp: 29, copyBp: [10, 10, 9] },
  ]
  const fourA = [{ unit: 0, count: 4, bp: 40, copyBp: [10, 10, 10, 10] }]
  expect(repeat.alleles).toEqual([
    { label: 'HG00128#1', sample: 'HG00128', bp: 49, runs: bThenA },
    { label: 'HG00128#2', sample: 'HG00128', bp: 40, runs: fourA },
    { label: 'HG00133#2', sample: 'HG00133', bp: 49, runs: bThenA },
    { label: 'GRCh38', sample: 'GRCh38', bp: 30 },
    { label: 'HG00099 (1)', sample: 'HG00099', bp: 40, runs: fourA },
    { label: 'HG00099 (2)', sample: 'HG00099', bp: 49, runs: bThenA },
  ])
})

test('a run stating only RUL is keyed by its length', () => {
  const repeat = tandemRepeatOf({
    ...base,
    ALT: ['<CNV:TR>'],
    INFO: { SVLEN: [30751], RN: [1], RUL: [5548], RUC: [5.5] },
    samples: { HG00097: { GT: ['1'] } },
  })!
  expect(repeat.units).toEqual([{ length: 5548, copies: 5.5 }])
  expect(repeat.alleles).toEqual([
    {
      label: 'HG00097',
      sample: 'HG00097',
      bp: 30514,
      runs: [{ unit: 0, count: 5.5, bp: 30514 }],
    },
  ])
})

test('a record with no samples draws its ALT alleles, naming no sample', () => {
  const { samples: _samples, ...sitesOnly } = tandem
  const { alleles } = tandemRepeatOf(sitesOnly)!
  expect(alleles.map(a => a.label)).toEqual(['ALT 1', 'ALT 2'])
  expect(alleles.map(a => a.sample)).toEqual([undefined, undefined])
})

test('a record stating no repeat has no alleles to draw', () => {
  expect(
    tandemRepeatOf({
      ...base,
      ALT: ['<CNV>'],
      INFO: { SVLEN: [5000] },
      samples: { HG002: { GT: ['0/1'] } },
    }),
  ).toBeUndefined()
})

test("a menu gates on the record's ALT, or on its type where that is all it has", () => {
  expect(hasTandemAllele({ ALT: ['<CNV:TR>', '<CNV:TR>'] })).toBe(true)
  expect(hasTandemAllele({ ALT: ['<CNV>'] })).toBe(false)
  expect(mayStateRepeat('copy_number_variation')).toBe(true)
  expect(mayStateRepeat('SNV,copy_number_variation')).toBe(true)
  expect(mayStateRepeat('insertion')).toBe(false)
  expect(mayStateRepeat(undefined)).toBe(false)
})

test('RUNAME names each unit, which the legend then uses', () => {
  const repeat = tandemRepeatOf({
    ...tandem,
    INFO: { ...tandem.INFO, RUNAME: ['KIV-2B', 'KIV-2A', 'KIV-2A'] },
  })!
  expect(repeat.units.map(u => u.name)).toEqual(['KIV-2A', 'KIV-2B'])
  expect(tandemRepeatOf(tandem)!.units.every(u => u.name === undefined)).toBe(
    true,
  )
})
