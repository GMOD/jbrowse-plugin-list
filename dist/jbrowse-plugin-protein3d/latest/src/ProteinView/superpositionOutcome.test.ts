import { expect, test } from 'vitest'

import {
  describeSuperposition,
  dissimilarFold,
  pairsCorrespond,
  shortChain,
  superpositionChip,
} from './superpositionOutcome'

const pivot = { label: 'AF-P01111-F1', chain: 'A' }
const peptide = { label: '7OW4', chain: 'C' }

test('the shorter chain decides whether TM-align can place it', () => {
  expect(
    shortChain({ ...pivot, residues: 189 }, { ...peptide, residues: 8 }),
  ).toEqual({ kind: 'short', residues: 8, of: peptide })
  expect(
    shortChain({ ...pivot, residues: 189 }, { ...peptide, residues: 166 }),
  ).toBeUndefined()
})

test('a TM-score under one half is no shared fold', () => {
  expect(dissimilarFold(0.27)).toEqual({ kind: 'dissimilar', tmScore: 0.27 })
  expect(dissimilarFold(0.87)).toBeUndefined()
})

test('a fit on residue pairs says why and on how many', () => {
  const outcome = {
    method: 'residue-pairs',
    structure: peptide,
    pivot,
    reason: { kind: 'short', residues: 8, of: peptide },
    pairs: { count: 8, identity: 1, rmsd: 4.62 },
  } as const
  expect(describeSuperposition(outcome)).toBe(
    '7OW4 chain C has 8 traced residues, too few for TM-align to place it, so 7OW4 chain C was superposed on AF-P01111-F1 chain A by the 8 residues aligned to the same transcript positions (RMSD 4.62 Å).',
  )
  expect(superpositionChip(outcome)).toBe('fit on 8 residues')
})

test('a TM-align placement reads its numbers and earns no chip', () => {
  const outcome = {
    method: 'tm-align',
    structure: { label: '9BTM', chain: 'A' },
    pivot,
    tmScore: 0.94,
    rmsd: 0.79,
    alignedLength: 168,
    pairs: { count: 168, identity: 0.99, rmsd: 0.8 },
  } as const
  expect(describeSuperposition(outcome)).toBe(
    'Superposed 9BTM chain A on AF-P01111-F1 chain A by TM-align: TM-score 0.94, RMSD 0.79 Å over 168 aligned residues; 168 residues aligned to the same transcript position sit 0.80 Å apart.',
  )
  expect(superpositionChip(outcome)).toBeUndefined()
})

test('an unmoved structure says whether its pairs were too few or too unalike', () => {
  const unmoved = (count: number, identity: number) =>
    describeSuperposition({
      method: 'unmoved',
      structure: { label: '9BTM', chain: 'B' },
      pivot,
      reason: { kind: 'dissimilar', tmScore: 0.29 },
      pairs: { count, identity },
    })
  expect(unmoved(48, 0.27)).toBe(
    "TM-align found no shared fold (TM-score 0.29, under 0.5), and the 48 residues aligned to the same transcript positions as AF-P01111-F1 chain A's are 27% identical, under the 50% that says they are the same protein's, so 9BTM chain B was left where its file places it.",
  )
  expect(unmoved(3, 1)).toMatch(/and only 3 residues align/)
  expect(pairsCorrespond({ count: 8, identity: 1 })).toBe(true)
  expect(pairsCorrespond({ count: 48, identity: 0.27 })).toBe(false)
})
