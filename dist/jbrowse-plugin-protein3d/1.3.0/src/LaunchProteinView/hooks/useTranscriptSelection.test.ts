import { SimpleFeature } from '@jbrowse/core/util'
import { expect, test } from 'vitest'

import { defaultTranscriptId } from './useTranscriptSelection'
import { rankIsoforms } from '../../AlignTranscriptRpc'
import { rankableIsoforms } from '../utils/util'

const transcript = (id: string) =>
  new SimpleFeature({
    uniqueId: id,
    refName: 'chr1',
    start: 0,
    end: 100,
    type: 'mRNA',
  })

const options = ['short', 'full', 'retained_intron'].map(transcript)
const isoformSequences = {
  short: { feature: options[0]!, seq: 'MKTAYIAK*' },
  full: { feature: options[1]!, seq: 'MKTAYIAKQRQISFVKSHF*' },
}
const { ranking } = rankIsoforms(rankableIsoforms(options, isoformSequences), [
  'MKTAYIAKQRQISFVKSHF',
])

const choose = (preferredTranscriptId?: string) =>
  defaultTranscriptId({
    options,
    isoformSequences,
    ranking,
    preferredTranscriptId,
  })

test('the isoform matching the structure leads when nothing was clicked', () => {
  expect(choose()).toBe('full')
})

test('the right-clicked isoform leads when it translates', () => {
  expect(choose('short')).toBe('short')
})

test('a clicked isoform with no translation, or not in this gene, is passed over', () => {
  expect(choose('retained_intron')).toBe('full')
  expect(choose('another-gene-mrna')).toBe('full')
})

test('the right-clicked isoform needs no ranking, and nothing else is picked without one', () => {
  const unranked = (preferredTranscriptId?: string) =>
    defaultTranscriptId({ options, isoformSequences, preferredTranscriptId })
  expect(unranked('short')).toBe('short')
  expect(unranked()).toBeUndefined()
})
