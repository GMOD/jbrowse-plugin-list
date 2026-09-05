import { expect, test } from 'vitest'

import { pickStructureSequence } from './util'

import type { Feature } from '@jbrowse/core/util'

// pickStructureSequence only reads `.seq`, so the feature is a placeholder
const feature = {} as Feature
const isoforms = (...seqs: string[]) =>
  Object.fromEntries(seqs.map((seq, i) => [`t${i}`, { feature, seq }]))

test('no structure sequences', () => {
  expect(pickStructureSequence(undefined, isoforms('MKV'))).toBeUndefined()
  expect(pickStructureSequence([], isoforms('MKV'))).toBeUndefined()
})

test('single chain is used regardless of matching', () => {
  expect(pickStructureSequence(['MKV'], isoforms('WWW'))).toBe('MKV')
})

test('prefers the chain an isoform translates to, not chain 0', () => {
  expect(
    pickStructureSequence(['DNACHAIN', 'MKVLA'], isoforms('QQQ', 'MKVLA')),
  ).toBe('MKVLA')
})

test('matches across the isoforms trailing stop codon', () => {
  expect(pickStructureSequence(['GGG', 'MKVLA'], isoforms('MKVLA*'))).toBe(
    'MKVLA',
  )
})

test('falls back to the first chain when nothing matches', () => {
  expect(pickStructureSequence(['AAA', 'BBB'], isoforms('CCC'))).toBe('AAA')
})

test('falls back to the first chain before isoforms have loaded', () => {
  expect(pickStructureSequence(['AAA', 'BBB'], undefined)).toBe('AAA')
})
