import { SimpleFeature } from '@jbrowse/core/util'
import { describe, expect, test } from 'vitest'

import { classifyIsoforms, selectBestTranscript } from './isoformRanking'
import {
  CDK2_1H26_ENTITY0,
  HBA_TRANSCRIPT_P69905,
  HBB_BETA_4HHB_ENTITY1,
  HBB_TRANSCRIPT_P68871,
  RAC1B_ISOFORM_B_P63000_2,
  RAC1_1MH1_ENTITY1,
  RAC1_ISOFORM_A_P63000_1,
} from '../../ProteinView/__fixtures__/structureFixtures'

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

  // 4HHB's β chain is HBB minus Met1, so no isoform matches exactly; the
  // longest-first fallback then took a longer paralog-like isoform over the
  // one the structure was made from.
  test('with no exact match, prefers the isoform that aligns best over the longest', () => {
    const isoformSequences = {
      'transcript-1': { feature: transcript1, seq: HBB_TRANSCRIPT_P68871 },
      'transcript-2': {
        feature: transcript2,
        seq: HBA_TRANSCRIPT_P69905 + CDK2_1H26_ENTITY0.slice(0, 80),
      },
    }
    const result = selectBestTranscript({
      options: [transcript1, transcript2],
      isoformSequences,
      structureSequence: HBB_BETA_4HHB_ENTITY1,
    })
    expect(result?.id()).toBe('transcript-1')
  })

  // Rac1b's extra exon aligns as a gap, so it matches every 1MH1 residue Rac1
  // does and ranking by identical residues then length chose it
  test('with no exact match, an isoform carrying an exon the structure lacks loses on score', () => {
    const isoformSequences = {
      'transcript-1': { feature: transcript1, seq: RAC1B_ISOFORM_B_P63000_2 },
      'transcript-2': { feature: transcript2, seq: RAC1_ISOFORM_A_P63000_1 },
    }
    const { nonMatches } = classifyIsoforms({
      options: [transcript1, transcript2],
      isoformSequences,
      structureSequence: RAC1_1MH1_ENTITY1,
    })
    expect(nonMatches[0]!.identical).toBe(nonMatches[1]!.identical)
    expect(nonMatches.map(r => r.feature.id())).toEqual([
      'transcript-2',
      'transcript-1',
    ])
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
