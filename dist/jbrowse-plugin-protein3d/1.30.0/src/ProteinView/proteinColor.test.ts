import { expect, test } from 'vitest'

import {
  COLOR_FIELDS,
  colorOfScheme,
  colorProblems,
  resolvedColor,
  trackStatLabel,
} from './proteinColor'
import { RESIDUE_COLORS } from './residueColors'

import type { ProteinColor } from './proteinColor'

test('every old colorScheme name lifts to a field the menu offers', () => {
  const lifted = [
    'plddt-confidence',
    'chain-id',
    'secondary-structure',
    'hydrophobicity',
    'residue-name',
    'uncertainty',
    'molecule-type',
    'mapped-chain',
    'alphamissense',
    'clinvar',
    'alignment-domains',
  ].map(name => colorOfScheme(name).field)
  const newerThanColorScheme = ['track', 'values', 'exon']
  const fields = Object.keys(COLOR_FIELDS).filter(
    f => !newerThanColorScheme.includes(f),
  )
  expect(lifted).toHaveLength(fields.length)
  expect(new Set(lifted)).toEqual(new Set(fields))
  expect(colorOfScheme('default')).toEqual({})
  expect(colorOfScheme('toString')).toEqual({})
})

test('a field Mol* or the alignment paints names the field alone', () => {
  expect(colorProblems({ field: 'chain' })).toEqual([])
  expect(colorProblems({ field: 'plddt', domain: [50] })).toEqual([
    "color.domain is refused: plddt paints in Mol*'s pLDDT bands, so its color names the field alone",
  ])
  expect(colorProblems({ field: 'exon', range: ['red'] })).toEqual([
    'color.range is refused: exon paints in a fixed palette repeated over the exons, so its color names the field alone',
  ])
  expect(colorProblems({ field: 'domain', range: ['red'] })).toEqual([
    "color.range is refused: domain paints in the connected alignment's colors, so its color names the field alone",
  ])
  expect(colorProblems({ range: ['red'] })).toEqual([
    'color names no field, so range paints nothing',
  ])
  expect(colorProblems({ field: 'colour' })[0]).toMatch(
    /^color.field "colour" is none of plddt, chain,/,
  )
  expect(colorProblems('alphamissense')).toEqual([
    "color is an object, such as { field: 'alphaMissense' }",
  ])
})

test("a field the plugin scales takes its scale's members over the preset", () => {
  const color = { field: 'alphaMissense', range: ['#000000', '#ffffff'] }
  expect(colorProblems(color)).toEqual([])
  expect(
    resolvedColor({ field: 'alphaMissense', range: ['#000000', '#ffffff'] }),
  ).toEqual({
    ...RESIDUE_COLORS.alphaMissense,
    range: ['#000000', '#ffffff'],
  })
  expect(colorProblems({ field: 'alphaMissense', domain: [0.5] })).toEqual([
    "color.domain is not a member of alphaMissense's linear scale, which takes scale, domainMin, domainMax, domainMid, range, labels, title",
  ])
  expect(
    colorProblems({ field: 'clinvarPathogenicCount', scale: 'linear' }),
  ).toEqual(['color.scale of clinvarPathogenicCount is threshold'])
  expect(
    colorProblems({ field: 'clinvarPathogenicCount', domain: [1, 5] }),
  ).toEqual([
    "color.range of clinvarPathogenicCount needs 3 colors, one more than domain's cuts",
  ])
  expect(colorProblems({ field: 'hydrophobicity', domainMid: '0' })).toEqual([
    'color.domainMid is a number',
  ])
})

test('every preset passes its own check', () => {
  const needs = { track: { trackId: 'phyloP' }, values: { values: [1] } }
  for (const field of Object.keys(RESIDUE_COLORS)) {
    expect(
      colorProblems({ field, ...needs[field as keyof typeof needs] }),
    ).toEqual([])
  }
  for (const preset of [
    RESIDUE_COLORS.hydrophobicity,
    RESIDUE_COLORS.alphaMissense,
    RESIDUE_COLORS.clinvarPathogenicCount,
  ]) {
    expect(colorProblems(preset)).toEqual([])
  }
})

test('a scale that cannot paint a value is refused before it reaches a painter', () => {
  expect(
    colorProblems({ field: 'alphaMissense', domainMin: 1, domainMax: 1 }),
  ).toEqual([
    'color.domainMin of alphaMissense is below domainMax; 1 is not below 1',
  ])
  expect(
    colorProblems({ field: 'hydrophobicity', domainMin: 5, domainMid: 4 }),
  ).toEqual([
    'color.domainMin of hydrophobicity is below domainMax; 5 is not below 4.5',
  ])
  expect(
    colorProblems({ field: 'alphaMissense', domainMin: 1, domainMax: 0 }),
  ).toEqual([])
  expect(colorProblems({ field: 'alphaMissense', domainMid: 2 })).toEqual([
    'color.domainMid of alphaMissense lies from domainMin to domainMax; 2 is outside 0–1',
  ])
  expect(
    colorProblems({ field: 'alphaMissense', domainMid: 1, domainMax: 1 }),
  ).toEqual([])
  expect(colorProblems({ field: 'alphaMissense', range: [] })).toEqual([
    'color.range of alphaMissense needs at least one color',
  ])
  expect(
    colorProblems({
      field: 'clinvarPathogenicCount',
      domain: [1, 4, 2, 5],
    }),
  ).toEqual([
    'color.domain of clinvarPathogenicCount ascends, each cut above the last; [1,4,2,5] does not',
  ])
  expect(
    colorProblems({ field: 'clinvarPathogenicCount', domain: [1, 1, 2, 3] }),
  ).toHaveLength(1)
})

test('a track field names its track and takes a stat', () => {
  expect(colorProblems({ field: 'track' })).toEqual([
    "color.trackId is required: a track's scores color a track field",
  ])
  expect(
    colorProblems({ field: 'track', trackId: 'phyloP', stat: 'max' }),
  ).toEqual([])
  expect(
    colorProblems({ field: 'track', trackId: 'phyloP', stat: 'sum' }),
  ).toEqual(['color.stat is one of mean, max, min, count'])
  expect(colorProblems({ field: 'track', trackId: '' })).toEqual([
    'color.trackId is a track id',
  ])
  expect(colorProblems({ field: 'hydrophobicity', trackId: 'phyloP' })).toEqual(
    [
      "color.trackId is not a member of hydrophobicity's linear scale, which takes scale, domainMin, domainMax, domainMid, range, labels, title",
    ],
  )
})

test('a track field leaves either end of a linear domain to the data', () => {
  expect(
    colorProblems({ field: 'track', trackId: 't', domainMin: 1, domainMax: 1 }),
  ).toHaveLength(1)
  expect(colorProblems({ field: 'track', trackId: 't', domainMin: 5 })).toEqual(
    [],
  )
})

test('a track field takes a threshold scale whose cuts the session names', () => {
  const sge: ProteinColor = {
    field: 'track',
    trackId: 'sge',
    scale: 'threshold',
    domain: [-1.328, -0.748],
    range: ['#d7191c', '#fdae61', '#abd9e9'],
  }
  expect(colorProblems(sge)).toEqual([])
  expect(resolvedColor(sge)).toEqual({
    field: 'track',
    scale: 'threshold',
    domain: [-1.328, -0.748],
    range: ['#d7191c', '#fdae61', '#abd9e9'],
    title: 'Genome track',
  })
  expect(
    colorProblems({ field: 'track', trackId: 'sge', scale: 'threshold' }),
  ).toEqual(["color.domain is required: the cuts of track's threshold scale"])
  expect(colorProblems({ ...sge, range: ['#d7191c'] })).toEqual([
    "color.range of track needs 3 colors, one more than domain's cuts",
  ])
  expect(colorProblems({ ...sge, scale: 'log' })).toContain(
    'color.scale of track is linear',
  )
})

test('a values field takes a list or an object keyed by residue number', () => {
  expect(colorProblems({ field: 'values' })).toEqual([
    'color.values is required: the numbers to color the residues by',
  ])
  expect(colorProblems({ field: 'values', values: [0.1, null, 3] })).toEqual([])
  expect(
    colorProblems({ field: 'values', values: { 248: -2, 273: 1.5 } }),
  ).toEqual([])
  expect(colorProblems({ field: 'values', values: { 0: 1 } })).toHaveLength(1)
  expect(colorProblems({ field: 'values', values: { a: 1 } })).toHaveLength(1)
  expect(colorProblems({ field: 'values', values: ['x'] })).toHaveLength(1)
})

// the genome-track dialog writes `labels: undefined` when the cuts change the
// number of bands, and checking it as a list threw inside Apply
test('a member left undefined is absent, not refused', () => {
  expect(
    colorProblems({
      field: 'track',
      trackId: 't',
      scale: 'threshold',
      domain: [0],
      range: ['#d7191c', '#2c7bb6'],
      labels: undefined,
    }),
  ).toEqual([])
})

test('a track field counts features, or reads a named field in place of score', () => {
  expect(
    colorProblems({ field: 'track', trackId: 'dog10k', stat: 'count' }),
  ).toEqual([])
  expect(
    colorProblems({
      field: 'track',
      trackId: 'gnomad',
      stat: 'max',
      scoreField: 'INFO.AF',
    }),
  ).toEqual([])
  expect(
    resolvedColor({ field: 'track', trackId: 'gnomad', scoreField: 'INFO.AF' }),
  ).toEqual(RESIDUE_COLORS.track)
})

test('a scoreField is a field name, and a count reads none', () => {
  expect(
    colorProblems({ field: 'track', trackId: 't', scoreField: 3 }),
  ).toEqual([
    'color.scoreField is a field name such as INFO.AF, not a jexl: expression',
  ])
  expect(
    colorProblems({
      field: 'track',
      trackId: 't',
      scoreField: 'jexl:get(feature,"INFO").AF',
    }),
  ).toEqual([
    'color.scoreField is a field name such as INFO.AF, not a jexl: expression',
  ])
  expect(
    colorProblems({
      field: 'track',
      trackId: 't',
      stat: 'count',
      scoreField: 'INFO.AF',
    }),
  ).toEqual([
    "color.scoreField is refused: stat count counts the track's features and reads no value",
  ])
  expect(
    colorProblems({
      field: 'track',
      stat: 'count',
      scoreField: 'INFO.AF',
      scale: 'threshold',
    }),
  ).toEqual([
    "color.trackId is required: a track's scores color a track field",
    "color.domain is required: the cuts of track's threshold scale",
    "color.scoreField is refused: stat count counts the track's features and reads no value",
  ])
  expect(
    colorProblems({ field: 'values', values: [1], scoreField: 'INFO.AF' }),
  ).toEqual([
    "color.scoreField is not a member of values's linear scale, which takes scale, domainMin, domainMax, domainMid, range, labels, title, values",
  ])
})

test("a track's legend says what each residue's value is", () => {
  expect(trackStatLabel({ field: 'track' })).toBe('mean per codon')
  expect(trackStatLabel({ field: 'track', stat: 'count' })).toBe(
    'features per codon',
  )
  expect(
    trackStatLabel({ field: 'track', stat: 'max', scoreField: 'INFO.AF' }),
  ).toBe('max INFO.AF per codon')
  expect(
    trackStatLabel({
      field: 'track',
      stat: 'count',
      filter: [
        { field: 'FILTER', equal: 'PASS' },
        { field: 'INFO.AF', gte: 0.01 },
      ],
    }),
  ).toBe('features per codon where FILTER = PASS, INFO.AF ≥ 0.01')
})

test("a track field's filter is a list of predicates over feature fields", () => {
  expect(
    colorProblems({
      field: 'track',
      trackId: 'dog10k',
      stat: 'count',
      filter: [
        { field: 'FILTER', equal: 'PASS' },
        { field: 'INFO.AF', range: [0.01, 0.5] },
        { field: 'INFO.CSQ', oneOf: ['missense_variant', 3] },
      ],
    }),
  ).toEqual([])
  expect(
    colorProblems({ field: 'track', trackId: 'dog10k', filter: [] }),
  ).toEqual([])
  expect(
    resolvedColor({
      field: 'track',
      trackId: 'dog10k',
      filter: [{ field: 'FILTER', equal: 'PASS' }],
    }),
  ).toEqual(RESIDUE_COLORS.track)
})

test.each([
  [
    "color.filter is a list of predicates such as [{ field: 'FILTER', equal: 'PASS' }]",
    { field: 'FILTER', equal: 'PASS' },
  ],
  [
    'color.filter[0].field is a feature field name such as FILTER or INFO.AF, not a jexl: expression, not "jexl:feature.QUAL > 30"',
    [{ field: 'jexl:feature.QUAL > 30', equal: true }],
  ],
  [
    'color.filter[0].eq is not an operator: a predicate takes field and one of equal, lt, lte, gt, gte, range, oneOf',
    [{ field: 'FILTER', eq: 'PASS' }],
  ],
  [
    'color.filter[0].equal is a string or a number, not true',
    [{ field: 'FILTER', equal: true }],
  ],
  ['color.filter[0].gte is a number, not "30"', [{ field: 'QUAL', gte: '30' }]],
  [
    'color.filter[0] selects nothing: its bounds run from 0.5 to 0.1',
    [{ field: 'INFO.AF', gt: 0.5, lt: 0.1 }],
  ],
])('%s', (problem, filter) => {
  expect(colorProblems({ field: 'track', trackId: 't', filter })).toEqual([
    problem,
  ])
})

test('a filter belongs to a track field', () => {
  expect(
    colorProblems({
      field: 'values',
      values: [1],
      filter: [{ field: 'FILTER', equal: 'PASS' }],
    }),
  ).toEqual([
    "color.filter is not a member of values's linear scale, which takes scale, domainMin, domainMax, domainMid, range, labels, title, values",
  ])
})
