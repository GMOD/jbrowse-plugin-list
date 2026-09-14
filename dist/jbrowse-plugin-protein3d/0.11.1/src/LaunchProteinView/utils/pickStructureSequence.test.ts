import { expect, test } from 'vitest'

import { pickStructureSequence, selectBestTranscript } from './isoformRanking'
import {
  CCNA2_1H26_ENTITY1,
  CDK2_1H26_ENTITY0,
  P53_PEPTIDE_1H26_ENTITY2,
  P53_TRANSCRIPT_P04637,
} from '../../ProteinView/__fixtures__/structureFixtures'

import type { Feature } from '@jbrowse/core/util'

const feature = (id: string) => ({ id: () => id }) as Feature
const isoforms = (...seqs: string[]) =>
  Object.fromEntries(
    seqs.map((seq, i) => [`t${i}`, { feature: feature(`t${i}`), seq }]),
  )

test('no structure sequences', () => {
  expect(pickStructureSequence(undefined, isoforms('MKV'))).toBeUndefined()
  expect(pickStructureSequence([], isoforms('MKV'))).toBeUndefined()
})

test('single chain is used regardless of matching', () => {
  expect(pickStructureSequence(['MKV'], isoforms('WWW'))).toBe('MKV')
})

test('prefers the chain an isoform translates to, not chain 0', () => {
  expect(
    pickStructureSequence(['GGGGGGGG', 'MKVLA'], isoforms('QQQ', 'MKVLA')),
  ).toBe('MKVLA')
})

test('matches across the isoforms trailing stop codon', () => {
  expect(pickStructureSequence(['GGG', 'MKVLA'], isoforms('MKVLA*'))).toBe(
    'MKVLA',
  )
})

test('falls back to the first chain when nothing aligns', () => {
  expect(pickStructureSequence(['AAA', 'GGG'], isoforms('WWW'))).toBe('AAA')
})

test('falls back to the first chain before isoforms have loaded', () => {
  expect(pickStructureSequence(['AAA', 'BBB'], undefined)).toBe('AAA')
})

// With no exact match the first chain was CDK2, and p53β, which ends before the
// bound peptide, won the isoform ranking on chance identities to the kinase.
test('1H26: isoforms are ranked against the p53 peptide, not CDK2', () => {
  const p53 = P53_TRANSCRIPT_P04637
  const p53beta = `${p53.slice(0, 331)}DQTSFQKENC`
  const sequences = isoforms(p53beta, p53)
  const chains = [
    CDK2_1H26_ENTITY0,
    CCNA2_1H26_ENTITY1,
    P53_PEPTIDE_1H26_ENTITY2,
  ]
  const structureSequence = pickStructureSequence(chains, sequences)
  expect(structureSequence).toBe(P53_PEPTIDE_1H26_ENTITY2)
  expect(
    selectBestTranscript({
      options: [feature('t0'), feature('t1')],
      isoformSequences: sequences,
      structureSequence,
    })?.id(),
  ).toBe('t1')
})
