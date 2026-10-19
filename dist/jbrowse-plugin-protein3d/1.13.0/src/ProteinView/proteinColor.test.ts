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
