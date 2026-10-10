import { identityUniProtPositionMap, makeUniProtPositionMap } from 'p2s_mapper'
import { expect, test } from 'vitest'

import {
  CLINVAR_COLORS,
  alphaMissenseRgb,
  clinVarRgb,
  meanScoreByPosition,
  placeValues,
} from './variantEffects'
import { parseAlphaMissense } from '../AlphaMissensePathogenicityAdapter/parseAlphaMissense'

test('averages every substitution at a residue, keyed by 1-based position', () => {
  const rows = parseAlphaMissense(
    [
      'protein_variant,am_pathogenicity,am_class',
      'M1A,0.2,LBen',
      'M1C,0.4,Amb',
      'V600E,0.9,LPath',
      'V600A,1,LPath',
    ].join('\n'),
  )
  const values = meanScoreByPosition(rows)
  expect(values.numbering).toBe('uniprot')
  const means = values.byPosition
  expect([...means.keys()]).toEqual([1, 600])
  expect(means.get(1)).toBeCloseTo(0.3)
  expect(means.get(600)).toBeCloseTo(0.95)
  // spelled from the reference residues, X where no row names one
  expect(values.numbering === 'uniprot' && values.sequence).toBe(
    `M${'X'.repeat(598)}V`,
  )
})

const entity = { entityId: '1', seqIds: [1, 2, 3, 4, 5] }

function entryValues(byPosition: [number, number][]) {
  return new Map(byPosition)
}

test('an AlphaFold model of the entry places position p on label_seq_id p', () => {
  const placed = placeValues(
    entryValues([
      [1, 0.1],
      [5, 0.9],
      [6, 0.5],
    ]),
    identityUniProtPositionMap,
    entity,
  )
  expect(placed.entityId).toBe('1')
  // position 6 is past the model's last residue
  expect([...placed.byLabelSeqId]).toEqual([
    [1, 0.1],
    [5, 0.9],
  ])
})

// 1TUP-like: the crystal holds UniProt 94-312 from its first position on, so
// UniProt 248 is structure position 154
test('a PDB entry places values through its SIFTS segments only', () => {
  const crystal = {
    entityId: '3',
    seqIds: Array.from({ length: 219 }, (_, i) => i + 1),
  }
  const placed = placeValues(
    entryValues([
      [93, 0.2],
      [94, 0.3],
      [248, 0.99],
      [313, 0.4],
    ]),
    makeUniProtPositionMap([
      {
        entityId: '3',
        unpStart: 94,
        unpEnd: 312,
        structStart: 0,
        structEnd: 218,
      },
    ]),
    crystal,
  )
  expect(placed.entityId).toBe('3')
  expect([...placed.byLabelSeqId]).toEqual([
    [1, 0.3],
    [155, 0.99],
  ])
})

// SEQRES-less numbering: label_seq_ids from an observed window, with a hole
test("places by the entity's own label_seq_ids, not position + 1", () => {
  const placed = placeValues(
    entryValues([
      [1, 0.1],
      [2, 0.2],
      [3, 0.3],
    ]),
    identityUniProtPositionMap,
    { entityId: '1', seqIds: [94, 95, 97] },
  )
  expect([...placed.byLabelSeqId]).toEqual([
    [94, 0.1],
    [95, 0.2],
    [97, 0.3],
  ])
})

test('the AlphaMissense ramp runs blue through white at 0.5 to red', () => {
  expect(alphaMissenseRgb(0)).toEqual([0x2c, 0x7b, 0xb6])
  expect(alphaMissenseRgb(0.5)).toEqual([255, 255, 255])
  expect(alphaMissenseRgb(1)).toEqual([0xd7, 0x19, 0x1c])
  expect(alphaMissenseRgb(0.75)).toEqual([235, 140, 142])
  expect(alphaMissenseRgb(-1)).toEqual(alphaMissenseRgb(0))
  expect(alphaMissenseRgb(2)).toEqual(alphaMissenseRgb(1))
})

test('the ClinVar ramp darkens per substitution and caps at four', () => {
  const steps = [0, 1, 2, 3, 4].map(clinVarRgb)
  expect(new Set(steps.map(String)).size).toBe(CLINVAR_COLORS.length)
  expect(clinVarRgb(9)).toEqual(clinVarRgb(4))
  // each step darker than the last
  const lightness = steps.map(([r, g, b]) => r + g + b)
  expect(lightness).toEqual([...lightness].sort((a, b) => b - a))
})
