import {
  pickRepeatTrack,
  repeatArraysFrom,
  repeatUnitOf,
} from './repeatFeatures'

const base = { refName: 'chr6', start: 160616002, end: 160646753 }

test('UCSC simpleRepeat / TRF: period wins over the consensus sequence', () => {
  const f = { ...base, period: 5548, sequence: 'ACGT', name: 'trf' }
  expect(repeatUnitOf(f)).toBe(5548)
  expect(repeatArraysFrom([f])[0]!.name).toBe('trf')
})

test('TRGT catalogue: first of MOTIFS, named by TRID', () => {
  const f = { ...base, TRID: 'HTT', MOTIFS: 'CAG,CCG', STRUC: '(CAG)n(CCG)n' }
  expect(repeatUnitOf(f)).toBe(3)
  expect(repeatArraysFrom([f])[0]).toMatchObject({ name: 'HTT', motif: 'CAG' })
})

// The spec's own <CNV:TR> example: RUS=CAG,CAG,CA,CAG grouped RN=1,3, so the
// first allele is (CAG)n and the unit is 3. RUL alone, a comma-joined list,
// or an IUPAC motif all state the same unit; a missing "." states none.
test('VCF 4.5 <CNV:TR>: RUL, else the first RUS', () => {
  const spec = {
    ...base,
    INFO: {
      RUS: ['CAG', 'CAG', 'CA', 'CAG'],
      RN: [1, 3],
      RB: [90, 15, 2, 12],
      SVLEN: [30, 30],
    },
  }
  expect(repeatUnitOf(spec)).toBe(3)
  expect(repeatArraysFrom([spec])[0]!.motif).toBe('CAG')
  expect(repeatUnitOf({ ...base, INFO: { RUL: '5548,2', RUS: '.' } })).toBe(
    5548,
  )
  expect(repeatUnitOf({ ...base, INFO: { RUS: 'CAR' } })).toBe(3)
  expect(repeatUnitOf({ ...base, INFO: { RUS: '.', RN: 1 } })).toBeUndefined()
})

test('ExpansionHunter and HipSTR VCF records read INFO', () => {
  const eh = {
    ...base,
    INFO: { RU: 'GGCCCC', REPID: 'C9ORF72', END: 160646753 },
  }
  expect(repeatUnitOf(eh)).toBe(6)
  expect(repeatArraysFrom([eh])[0]!.name).toBe('C9ORF72')
  const hipstr = { ...base, INFO: { PERIOD: [4], START: 1 } }
  expect(repeatUnitOf(hipstr)).toBe(4)
})

test('TRGT catalogue BED: the name column packs ID, MOTIFS and STRUC', () => {
  const f = { ...base, name: 'ID=HTT;MOTIFS=CAG,CCG;STRUC=(CAG)nCAACAG(CCG)n' }
  expect(repeatUnitOf(f)).toBe(3)
  expect(repeatArraysFrom([f])[0]).toMatchObject({ name: 'HTT', motif: 'CAG' })
  const noId = { ...base, name: 'MOTIFS=CAG;STRUC=(CAG)n' }
  expect(repeatArraysFrom([noId])[0]!.name).toBe('(CAG)n')
})

test('vamos motifs and an unnamed array fall back to a motif or locus name', () => {
  const vamos = { ...base, motifs: ['ATCGATCG', 'ATCGATCC'] }
  expect(repeatArraysFrom([vamos])[0]!.name).toBe('(ATCGATCG)n')
  const period = { ...base, period: 5548 }
  expect(repeatArraysFrom([period])[0]!.name).toBe(
    'chr6:160,616,003-160,646,753',
  )
})

test('a feature stating no unit is left out, and rows sort by start', () => {
  const arrays = repeatArraysFrom([
    { ...base, start: 5000, end: 6000, period: 2 },
    { ...base, name: 'no unit' },
    { ...base, start: 100, end: 200, motif: 'CAG' },
  ])
  expect(arrays.map(a => a.start)).toEqual([100, 5000])
})

test('the repeat track is the named one, else one whose name says repeats', () => {
  const tracks = [
    { trackId: 'genes', name: 'NCBI RefSeq', adapterType: 'Gff3TabixAdapter' },
    { trackId: 'simple', name: 'Simple Repeats', adapterType: 'BigBedAdapter' },
    { trackId: 'bed', name: 'other', adapterType: 'BedAdapter' },
  ]
  expect(pickRepeatTrack(tracks, '')?.trackId).toBe('simple')
  expect(pickRepeatTrack(tracks, 'bed')?.trackId).toBe('bed')
  expect(pickRepeatTrack([tracks[2]!], '')).toBeUndefined()
})

test("a TRGT VCF's per-sample AL and SD are each sample's called alleles", () => {
  const f = {
    ...base,
    INFO: { TRID: 'ABCA7', MOTIFS: 'CCCCGTGAGC' },
    samples: {
      HG00099: { GT: ['1/2'], AL: [387, 3161], SD: [7, 1] },
      HG02559: { GT: ['1/1'], AL: '491,491', SD: '1,0' },
      HG00280: { GT: ['3/4'], AL: [1047, 1049] },
      NA00001: { GT: ['./.'], AL: ['.'] },
    },
  }
  expect(repeatArraysFrom([f])[0]!.calls).toEqual({
    HG00099: [
      { bp: 387, spanningReads: 7 },
      { bp: 3161, spanningReads: 1 },
    ],
    HG02559: [
      { bp: 491, spanningReads: 1 },
      { bp: 491, spanningReads: 0 },
    ],
    HG00280: [{ bp: 1047 }, { bp: 1049 }],
  })
  expect(repeatArraysFrom([{ ...base, period: 2 }])[0]!.calls).toBe(undefined)
})
