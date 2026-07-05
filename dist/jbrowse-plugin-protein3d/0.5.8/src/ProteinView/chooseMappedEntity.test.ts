import { expect, test } from 'vitest'

import {
  DNA_1TUP_ENTITY0,
  HBA_ALPHA_4HHB_ENTITY0,
  HBA_TRANSCRIPT_P69905,
  HBB_BETA_4HHB_ENTITY1,
  HBB_TRANSCRIPT_P68871,
  P53_1TUP_ENTITY2,
  P53_TRANSCRIPT_P04637,
} from './__fixtures__/structureFixtures'
import {
  chooseMappedEntity,
  interactionMatchesMappedEntity,
} from './chooseMappedEntity'

const HEMOGLOBIN = [HBA_ALPHA_4HHB_ENTITY0, HBB_BETA_4HHB_ENTITY1]

// The bug: entity[0] is always used. These document why that's wrong, then that
// chooseMappedEntity fixes it.

test('4HHB: a β (HBB) transcript maps to entity[1], not the hardcoded [0]=α', () => {
  const sel = chooseMappedEntity(HBB_TRANSCRIPT_P68871, HEMOGLOBIN, 'smith_waterman')
  expect(sel?.index).toBe(1)
  // entity[0] (the old behavior) would have been the wrong chain
  expect(sel?.index).not.toBe(0)
})

test('4HHB: an α (HBA) transcript still maps to entity[0]=α (not always [1])', () => {
  const sel = chooseMappedEntity(HBA_TRANSCRIPT_P69905, HEMOGLOBIN, 'smith_waterman')
  expect(sel?.index).toBe(0)
})

test('1TUP: p53 maps to the protein entity[2], not the DNA strands at [0]/[1]', () => {
  const entities = [DNA_1TUP_ENTITY0, DNA_1TUP_ENTITY0, P53_1TUP_ENTITY2]
  const sel = chooseMappedEntity(P53_TRANSCRIPT_P04637, entities, 'smith_waterman')
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
  expect(sel?.alignment.consensus).toBe('|'.repeat(HBA_ALPHA_4HHB_ENTITY0.length))
})

test('returns undefined when there is nothing to map', () => {
  expect(chooseMappedEntity('', HEMOGLOBIN, 'smith_waterman')).toBeUndefined()
  expect(chooseMappedEntity(HBB_TRANSCRIPT_P68871, [], 'smith_waterman')).toBeUndefined()
})

test('interactionMatchesMappedEntity: only the mapped entity drives navigation', () => {
  // hovering the mapped entity → allowed
  expect(interactionMatchesMappedEntity('2', '2')).toBe(true)
  // hovering a different chain (e.g. the partner) → rejected
  expect(interactionMatchesMappedEntity('1', '2')).toBe(false)
  // no mapping resolved (standalone structure) → everything interactive
  expect(interactionMatchesMappedEntity('1', undefined)).toBe(true)
})
