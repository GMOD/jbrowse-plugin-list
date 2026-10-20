import { expect, test } from 'vitest'

import {
  COLOR_FIELDS,
  colorOfScheme,
  colorProblems,
  resolvedColor,
} from './proteinColor'
import { RESIDUE_COLORS } from './residueColors'

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
  expect(lifted).toHaveLength(Object.keys(COLOR_FIELDS).length)
  expect(new Set(lifted)).toEqual(new Set(Object.keys(COLOR_FIELDS)))
  expect(colorOfScheme('default')).toEqual({})
  expect(colorOfScheme('toString')).toEqual({})
})

test('a field Mol* or the alignment paints names the field alone', () => {
  expect(colorProblems({ field: 'chain' })).toEqual([])
  expect(colorProblems({ field: 'plddt', domain: [50] })).toEqual([
    "color.domain is refused: plddt paints in Mol*'s pLDDT bands, so its color names the field alone",
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
  for (const field of Object.keys(RESIDUE_COLORS)) {
    expect(colorProblems({ field })).toEqual([])
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
