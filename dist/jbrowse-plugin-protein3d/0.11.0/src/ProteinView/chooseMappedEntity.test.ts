import { expect, test } from 'vitest'

import {
  CCNA2_1H26_ENTITY1,
  CDK2_1H26_ENTITY0,
  DNA_1TUP_ENTITY0,
  HBA_ALPHA_4HHB_ENTITY0,
  HBA_TRANSCRIPT_P69905,
  HBB_BETA_4HHB_ENTITY1,
  HBB_TRANSCRIPT_P68871,
  P53_1TUP_ENTITY2,
  P53_PEPTIDE_1H26_ENTITY2,
  P53_PEPTIDE_4ZZJ_ENTITY1,
  P53_TRANSCRIPT_P04637,
  RPS11_7K00_CHAIN_K,
  SIRT1_4ZZJ_ENTITY0,
  TRNA_FRAGMENT_7K00_CHAIN_5,
} from './__fixtures__/structureFixtures'
import {
  alignTranscriptToEntity,
  chooseMappedEntity,
  interactionMatchesMappedEntity,
} from './chooseMappedEntity'
import { MAX_ALIGNMENT_CELLS } from './pairwiseAlignment'
import { structureSeqVsTranscriptSeqMap } from '../mappings'

const HEMOGLOBIN = [HBA_ALPHA_4HHB_ENTITY0, HBB_BETA_4HHB_ENTITY1]

// The bug: entity[0] is always used. These document why that's wrong, then that
// chooseMappedEntity fixes it.

test('4HHB: a β (HBB) transcript maps to entity[1], not the hardcoded [0]=α', () => {
  const sel = chooseMappedEntity(
    HBB_TRANSCRIPT_P68871,
    HEMOGLOBIN,
    'smith_waterman',
  )
  expect(sel?.index).toBe(1)
  // entity[0] (the old behavior) would have been the wrong chain
  expect(sel?.index).not.toBe(0)
})

test('4HHB: an α (HBA) transcript still maps to entity[0]=α (not always [1])', () => {
  const sel = chooseMappedEntity(
    HBA_TRANSCRIPT_P69905,
    HEMOGLOBIN,
    'smith_waterman',
  )
  expect(sel?.index).toBe(0)
})

test('1TUP: p53 maps to the protein entity[2], not the DNA strands at [0]/[1]', () => {
  const entities = [DNA_1TUP_ENTITY0, DNA_1TUP_ENTITY0, P53_1TUP_ENTITY2]
  const sel = chooseMappedEntity(
    P53_TRANSCRIPT_P04637,
    entities,
    'smith_waterman',
  )
  expect(sel?.index).toBe(2)
})

// A peptide-plus-partner entry is the commonest shape a p53 PDB entry takes,
// and the partner is always the longer chain. Counting identical residues
// picked the partner on both of these (CDK2 58 to 11, SIRT1 63 to 6); the
// share of the entity the transcript explains picks the peptide.
test('1H26: the 11-residue p53 peptide wins over CDK2 and cyclin A2', () => {
  const sel = chooseMappedEntity(
    P53_TRANSCRIPT_P04637,
    [CDK2_1H26_ENTITY0, CCNA2_1H26_ENTITY1, P53_PEPTIDE_1H26_ENTITY2],
    'smith_waterman',
  )
  expect(sel?.index).toBe(2)
  const cdk2 = alignTranscriptToEntity(
    P53_TRANSCRIPT_P04637,
    CDK2_1H26_ENTITY0,
    'smith_waterman',
  )!
  expect(cdk2.matches).toBeGreaterThan(sel!.matches)
})

test('4ZZJ: the 7-residue acetylated p53 peptide wins over SIRT1', () => {
  const sel = chooseMappedEntity(
    P53_TRANSCRIPT_P04637,
    [SIRT1_4ZZJ_ENTITY0, P53_PEPTIDE_4ZZJ_ENTITY1],
    'smith_waterman',
  )
  expect(sel?.index).toBe(1)
})

test('a decoy chain and a two-residue fragment both score below a real one', () => {
  const decoys = [RPS11_7K00_CHAIN_K, TRNA_FRAGMENT_7K00_CHAIN_5]
  for (const real of [P53_PEPTIDE_4ZZJ_ENTITY1, P53_1TUP_ENTITY2]) {
    const sel = chooseMappedEntity(
      P53_TRANSCRIPT_P04637,
      [...decoys, real],
      'smith_waterman',
    )
    expect(sel?.index).toBe(2)
  }
})

// A DNA strand's letters are amino-acid letters too, so it aligns like a
// protein and must be excluded by type rather than trusted to score low.
test('a nucleic-acid entity is never chosen, even when it is the only match', () => {
  const dna = { seq: DNA_1TUP_ENTITY0, nucleicAcid: true }
  expect(
    chooseMappedEntity(DNA_1TUP_ENTITY0, [dna], 'smith_waterman'),
  ).toBeUndefined()
  const sel = chooseMappedEntity(
    P53_TRANSCRIPT_P04637,
    [dna, dna, { seq: P53_1TUP_ENTITY2 }],
    'smith_waterman',
  )
  expect(sel?.index).toBe(2)
})

test('exact match (initiator-Met-stripped) is selected and reported as full identity', () => {
  // 4HHB α equals HBA minus the leading Met — not exact, so falls to alignment
  const sel = chooseMappedEntity(
    HBA_ALPHA_4HHB_ENTITY0, // transcript identical to the entity seq
    HEMOGLOBIN,
    'smith_waterman',
  )
  expect(sel?.index).toBe(0)
  expect(sel?.matches).toBe(HBA_ALPHA_4HHB_ENTITY0.length)
  // identity alignment: consensus all '|'
  expect(sel?.alignment.consensus).toBe(
    '|'.repeat(HBA_ALPHA_4HHB_ENTITY0.length),
  )
})

test('returns undefined when there is nothing to map', () => {
  expect(chooseMappedEntity('', HEMOGLOBIN, 'smith_waterman')).toBeUndefined()
  expect(
    chooseMappedEntity(HBB_TRANSCRIPT_P68871, [], 'smith_waterman'),
  ).toBeUndefined()
})

// One O(len^2) main-thread DP per chain: a big complex used to pay it once per
// copy of the same chain, and an oversized chain could hang the tab outright.
test('aligns each distinct entity sequence once, however many copies there are', () => {
  // 4HHB is α,β,α,β — two distinct sequences across four chains
  const tetramer = [
    HBA_ALPHA_4HHB_ENTITY0,
    HBB_BETA_4HHB_ENTITY1,
    HBA_ALPHA_4HHB_ENTITY0,
    HBB_BETA_4HHB_ENTITY1,
  ]
  const sel = chooseMappedEntity(
    HBB_TRANSCRIPT_P68871,
    tetramer,
    'smith_waterman',
  )
  // first copy of the winning sequence wins; the duplicate scores identically
  expect(sel?.index).toBe(1)
  expect(sel?.matches).toBe(
    chooseMappedEntity(
      HBB_TRANSCRIPT_P68871,
      [HBB_BETA_4HHB_ENTITY1],
      'smith_waterman',
    )?.matches,
  )
})

test('skips entities too large to align instead of hanging on them', () => {
  const huge = 'A'.repeat(MAX_ALIGNMENT_CELLS)
  const sel = chooseMappedEntity(
    HBB_TRANSCRIPT_P68871,
    [huge, HBB_BETA_4HHB_ENTITY1],
    'smith_waterman',
  )
  expect(sel?.index).toBe(1)
})

// The alignment's transcript row has to stay in the same coordinate space as
// g2p, whose protein positions are codon indices — so an interior stop stays in
// place and only the terminal one is dropped. Stripping all of them used to
// shift every residue after the interior stop by one codon.
test('an interior stop codon keeps transcript coordinates aligned with g2p', () => {
  const sel = chooseMappedEntity('MKAA*WYVL*', ['MKAAWYVL'], 'needleman_wunsch')
  expect(sel?.alignment.alns[0].seq).toBe('MKAA*WYVL')
  expect(sel?.alignment.alns[1].seq).toBe('MKAA-WYVL')

  const { structureSeqToTranscriptSeqPosition } =
    structureSeqVsTranscriptSeqMap(sel!.alignment)
  // structure residue 4 is 'W', which is codon 5 of the transcript, not codon 4
  expect(structureSeqToTranscriptSeqPosition[4]).toBe(5)
  expect(structureSeqToTranscriptSeqPosition[7]).toBe(8)
})

test('interactionMatchesMappedEntity: only the mapped entity drives navigation', () => {
  // hovering the mapped entity → allowed
  expect(interactionMatchesMappedEntity('2', '2')).toBe(true)
  // hovering a different chain (e.g. the partner) → rejected
  expect(interactionMatchesMappedEntity('1', '2')).toBe(false)
  // no mapping resolved (standalone structure) → everything interactive
  expect(interactionMatchesMappedEntity('1', undefined)).toBe(true)
})
