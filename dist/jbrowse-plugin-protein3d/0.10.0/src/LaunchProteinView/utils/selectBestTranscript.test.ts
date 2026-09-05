import { SimpleFeature } from '@jbrowse/core/util'
import { describe, expect, test } from 'vitest'

import { selectBestTranscript } from './util'

describe('selectBestTranscript', () => {
  const transcript1 = new SimpleFeature({
    uniqueId: 'transcript-1',
    refName: 'chr1',
    start: 0,
    end: 1000,
  })
  const transcript2 = new SimpleFeature({
    uniqueId: 'transcript-2',
    refName: 'chr1',
    start: 0,
    end: 2000,
  })
  const transcript3 = new SimpleFeature({
    uniqueId: 'transcript-3',
    refName: 'chr1',
    start: 0,
    end: 3000,
  })

  test('returns undefined when no isoforms have data', () => {
    const result = selectBestTranscript({
      options: [transcript1, transcript2],
      isoformSequences: {},
      structureSequence: undefined,
    })
    expect(result).toBeUndefined()
  })

  test('returns the longest transcript when no structure sequence provided', () => {
    const isoformSequences = {
      'transcript-1': {
        feature: transcript1,
        seq: 'MKTVRQERL',
      },
      'transcript-2': {
        feature: transcript2,
        seq: 'MKTVRQERLKSIVRILERSKEPVSGAQLAEEL',
      },
    }

    const result = selectBestTranscript({
      options: [transcript1, transcript2],
      isoformSequences,
      structureSequence: undefined,
    })

    expect(result?.id()).toBe('transcript-2')
  })

  test('returns transcript matching structure sequence exactly', () => {
    const isoformSequences = {
      'transcript-1': {
        feature: transcript1,
        seq: 'MKTVRQERL',
      },
      'transcript-2': {
        feature: transcript2,
        seq: 'MUCH_LONGER_SEQUENCE',
      },
    }

    const result = selectBestTranscript({
      options: [transcript1, transcript2],
      isoformSequences,
      structureSequence: 'MKTVRQERL',
    })

    expect(result?.id()).toBe('transcript-1')
  })

  test('prefers exact match over longest sequence', () => {
    const isoformSequences = {
      'transcript-1': {
        feature: transcript1,
        seq: 'EXACT_MATCH',
      },
      'transcript-2': {
        feature: transcript2,
        seq: 'MUCH_MUCH_MUCH_LONGER_SEQUENCE_NOT_EXACT',
      },
    }

    const result = selectBestTranscript({
      options: [transcript1, transcript2],
      isoformSequences,
      structureSequence: 'EXACT_MATCH',
    })

    expect(result?.id()).toBe('transcript-1')
  })

  test('ignores stop codons when matching structure sequence', () => {
    const isoformSequences = {
      'transcript-1': {
        feature: transcript1,
        seq: 'MKTVRQERL*',
      },
      'transcript-2': {
        feature: transcript2,
        seq: 'DIFFERENT',
      },
    }

    const result = selectBestTranscript({
      options: [transcript1, transcript2],
      isoformSequences,
      structureSequence: 'MKTVRQERL',
    })

    expect(result?.id()).toBe('transcript-1')
  })

  test('falls back to longest when structure sequence does not match any transcript', () => {
    const isoformSequences = {
      'transcript-1': {
        feature: transcript1,
        seq: 'SHORT',
      },
      'transcript-2': {
        feature: transcript2,
        seq: 'MUCH_LONGER_SEQUENCE',
      },
    }

    const result = selectBestTranscript({
      options: [transcript1, transcript2],
      isoformSequences,
      structureSequence: 'NO_MATCH',
    })

    expect(result?.id()).toBe('transcript-2')
  })

  test('only considers transcripts with sequence data', () => {
    const isoformSequences = {
      'transcript-1': {
        feature: transcript1,
        seq: 'SHORT_SEQ',
      },
    }

    const result = selectBestTranscript({
      options: [transcript1, transcript2, transcript3],
      isoformSequences,
      structureSequence: undefined,
    })

    expect(result?.id()).toBe('transcript-1')
  })

  test('handles empty options array', () => {
    const result = selectBestTranscript({
      options: [],
      isoformSequences: {},
      structureSequence: undefined,
    })

    expect(result).toBeUndefined()
  })

  test('selects among multiple candidates with equal lengths', () => {
    const isoformSequences = {
      'transcript-1': {
        feature: transcript1,
        seq: 'SAME_LEN_1',
      },
      'transcript-2': {
        feature: transcript2,
        seq: 'SAME_LEN_2',
      },
    }

    const result = selectBestTranscript({
      options: [transcript1, transcript2],
      isoformSequences,
      structureSequence: undefined,
    })

    expect(result).toBeDefined()
    expect(['transcript-1', 'transcript-2']).toContain(result?.id())
  })
})
