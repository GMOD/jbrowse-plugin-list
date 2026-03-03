import { SimpleFeature } from '@jbrowse/core/util'
import { describe, expect, test } from 'vitest'

import {
  extractFeatureIdentifiers,
  getDatabaseTypeForId,
  getUniProtIdFromFeature,
  isRecognizedDatabaseId,
} from './util'

describe('getUniProtIdFromFeature', () => {
  test('returns undefined for undefined feature', () => {
    expect(getUniProtIdFromFeature(undefined)).toBeUndefined()
  })

  test('returns uniprot attribute when present', () => {
    const feature = new SimpleFeature({
      uniqueId: 'test-1',
      refName: 'chr1',
      start: 0,
      end: 100,
      uniprot: 'P12345',
    })
    expect(getUniProtIdFromFeature(feature)).toBe('P12345')
  })

  test('returns uniprotId attribute when uniprot is missing', () => {
    const feature = new SimpleFeature({
      uniqueId: 'test-2',
      refName: 'chr1',
      start: 0,
      end: 100,
      uniprotId: 'Q67890',
    })
    expect(getUniProtIdFromFeature(feature)).toBe('Q67890')
  })

  test('returns uniprotid attribute (lowercase) when others are missing', () => {
    const feature = new SimpleFeature({
      uniqueId: 'test-3',
      refName: 'chr1',
      start: 0,
      end: 100,
      uniprotid: 'A11111',
    })
    expect(getUniProtIdFromFeature(feature)).toBe('A11111')
  })

  test('prefers uniprot over uniprotId', () => {
    const feature = new SimpleFeature({
      uniqueId: 'test-4',
      refName: 'chr1',
      start: 0,
      end: 100,
      uniprot: 'P12345',
      uniprotId: 'Q67890',
    })
    expect(getUniProtIdFromFeature(feature)).toBe('P12345')
  })

  test('prefers uniprotId over uniprotid', () => {
    const feature = new SimpleFeature({
      uniqueId: 'test-5',
      refName: 'chr1',
      start: 0,
      end: 100,
      uniprotId: 'Q67890',
      uniprotid: 'A11111',
    })
    expect(getUniProtIdFromFeature(feature)).toBe('Q67890')
  })

  test('returns undefined when no uniprot attribute present', () => {
    const feature = new SimpleFeature({
      uniqueId: 'test-6',
      refName: 'chr1',
      start: 0,
      end: 100,
      gene_name: 'BRCA1',
    })
    expect(getUniProtIdFromFeature(feature)).toBeUndefined()
  })

  test('handles GFF-style feature with uniprot in attributes', () => {
    const feature = new SimpleFeature({
      uniqueId: 'gene-ENSG00000012345',
      refName: 'chr17',
      start: 1000,
      end: 5000,
      type: 'gene',
      gene_name: 'TP53',
      uniprot: 'P04637',
    })
    expect(getUniProtIdFromFeature(feature)).toBe('P04637')
  })
})

describe('isRecognizedDatabaseId', () => {
  test('recognizes Ensembl gene IDs', () => {
    expect(isRecognizedDatabaseId('ENSG00000164690')).toBe(true)
    expect(isRecognizedDatabaseId('ENSMUSG00000001234')).toBe(true)
  })

  test('recognizes Ensembl transcript IDs', () => {
    expect(isRecognizedDatabaseId('ENST00000123456')).toBe(true)
    expect(isRecognizedDatabaseId('ENSMUST00000001234')).toBe(true)
  })

  test('recognizes Ensembl protein IDs', () => {
    expect(isRecognizedDatabaseId('ENSP00000123456')).toBe(true)
  })

  test('recognizes RefSeq mRNA IDs', () => {
    expect(isRecognizedDatabaseId('NM_000193')).toBe(true)
    expect(isRecognizedDatabaseId('NM_001310462')).toBe(true)
    expect(isRecognizedDatabaseId('XM_011516479')).toBe(true)
  })

  test('recognizes RefSeq non-coding RNA IDs', () => {
    expect(isRecognizedDatabaseId('NR_132318')).toBe(true)
    expect(isRecognizedDatabaseId('XR_001234')).toBe(true)
  })

  test('recognizes RefSeq protein IDs', () => {
    expect(isRecognizedDatabaseId('NP_000184')).toBe(true)
    expect(isRecognizedDatabaseId('NP_001297391')).toBe(true)
    expect(isRecognizedDatabaseId('XP_011514781')).toBe(true)
  })

  test('recognizes CCDS IDs', () => {
    expect(isRecognizedDatabaseId('CCDS5514')).toBe(true)
  })

  test('recognizes HGNC IDs', () => {
    expect(isRecognizedDatabaseId('HGNC:10848')).toBe(true)
  })

  test('does not recognize gene symbols', () => {
    expect(isRecognizedDatabaseId('SHH')).toBe(false)
    expect(isRecognizedDatabaseId('BRCA1')).toBe(false)
  })
})

describe('getDatabaseTypeForId', () => {
  test('returns ensembl for Ensembl IDs', () => {
    expect(getDatabaseTypeForId('ENSG00000164690')).toBe('ensembl')
    expect(getDatabaseTypeForId('ENST00000123456')).toBe('ensembl')
    expect(getDatabaseTypeForId('ENSP00000123456')).toBe('ensembl')
  })

  test('returns refseq for RefSeq IDs', () => {
    expect(getDatabaseTypeForId('NM_000193')).toBe('refseq')
    expect(getDatabaseTypeForId('NR_132318')).toBe('refseq')
    expect(getDatabaseTypeForId('NP_000184')).toBe('refseq')
    expect(getDatabaseTypeForId('XM_011516479')).toBe('refseq')
  })

  test('returns ccds for CCDS IDs', () => {
    expect(getDatabaseTypeForId('CCDS5514')).toBe('ccds')
  })

  test('returns hgnc for HGNC IDs', () => {
    expect(getDatabaseTypeForId('HGNC:10848')).toBe('hgnc')
  })

  test('returns undefined for unrecognized IDs', () => {
    expect(getDatabaseTypeForId('SHH')).toBeUndefined()
    expect(getDatabaseTypeForId('BRCA1')).toBeUndefined()
  })
})

describe('extractFeatureIdentifiers', () => {
  test('returns empty array for undefined feature', () => {
    expect(extractFeatureIdentifiers(undefined)).toEqual({ recognizedIds: [] })
  })

  test('extracts RefSeq ID from ID attribute with version', () => {
    const feature = new SimpleFeature({
      uniqueId: 'test-1',
      refName: 'chr7',
      start: 155799980,
      end: 155809163,
      ID: 'NM_001310462.2',
      gene_id: 'SHH',
      name: 'SHH',
    })
    const result = extractFeatureIdentifiers(feature)
    expect(result.recognizedIds).toContain('NM_001310462')
    expect(result.geneName).toBe('SHH')
  })

  test('extracts RefSeq ID from transcript_id attribute', () => {
    const feature = new SimpleFeature({
      uniqueId: 'test-2',
      refName: 'chr7',
      start: 155799980,
      end: 155809163,
      transcript_id: 'NM_000193.4',
      gene_id: 'SHH',
    })
    const result = extractFeatureIdentifiers(feature)
    expect(result.recognizedIds).toContain('NM_000193')
  })

  test('extracts protein accession from protAcc attribute', () => {
    const feature = new SimpleFeature({
      uniqueId: 'test-3',
      refName: 'chr7',
      start: 155799980,
      end: 155809163,
      ID: 'NM_001310462.2',
      protAcc: 'NP_001297391.1',
      gene_id: 'SHH',
    })
    const result = extractFeatureIdentifiers(feature)
    expect(result.recognizedIds).toContain('NM_001310462')
    expect(result.recognizedIds).toContain('NP_001297391')
  })

  test('extracts HGNC from numeric hgnc attribute', () => {
    const feature = new SimpleFeature({
      uniqueId: 'test-4',
      refName: 'chr7',
      start: 155799980,
      end: 155809163,
      ID: 'NM_001310462.2',
      hgnc: '10848',
      gene_id: 'SHH',
    })
    const result = extractFeatureIdentifiers(feature)
    expect(result.recognizedIds).toContain('HGNC:10848')
  })

  test('extracts HGNC from number hgnc attribute', () => {
    const feature = new SimpleFeature({
      uniqueId: 'test-5',
      refName: 'chr7',
      start: 155799980,
      end: 155809163,
      ID: 'NM_001310462.2',
      hgnc: 10848,
      gene_id: 'SHH',
    })
    const result = extractFeatureIdentifiers(feature)
    expect(result.recognizedIds).toContain('HGNC:10848')
  })

  test('handles SHH transcript feature from GFF', () => {
    // Simulates the GFF data provided
    const feature = new SimpleFeature({
      uniqueId: 'NM_001310462.2',
      refName: 'chr7',
      start: 155799980,
      end: 155809163,
      ID: 'NM_001310462.2',
      gene_id: 'SHH',
      transcript_id: 'NM_001310462.2',
      id: 'NM_001310462.2',
      name: 'SHH',
      protAcc: 'NP_001297391.1',
      hgnc: '10848',
    })
    const result = extractFeatureIdentifiers(feature)

    // Should extract RefSeq transcript ID
    expect(result.recognizedIds).toContain('NM_001310462')

    // Should extract RefSeq protein ID
    expect(result.recognizedIds).toContain('NP_001297391')

    // Should extract HGNC ID
    expect(result.recognizedIds).toContain('HGNC:10848')

    // Gene name should be SHH
    expect(result.geneName).toBe('SHH')
  })

  test('handles XM_ model transcripts', () => {
    const feature = new SimpleFeature({
      uniqueId: 'XM_011516479.3',
      refName: 'chr7',
      start: 155799980,
      end: 155809163,
      ID: 'XM_011516479.3',
      gene_id: 'SHH',
      transcript_id: 'XM_011516479.3',
      protAcc: 'XP_011514781.1',
      hgnc: '10848',
    })
    const result = extractFeatureIdentifiers(feature)

    expect(result.recognizedIds).toContain('XM_011516479')
    expect(result.recognizedIds).toContain('XP_011514781')
    expect(result.recognizedIds).toContain('HGNC:10848')
  })

  test('handles NR_ non-coding transcripts', () => {
    const feature = new SimpleFeature({
      uniqueId: 'NR_132318.2',
      refName: 'chr7',
      start: 155799980,
      end: 155809163,
      ID: 'NR_132318.2',
      gene_id: 'SHH',
      transcript_id: 'NR_132318.2',
      hgnc: '10848',
    })
    const result = extractFeatureIdentifiers(feature)

    expect(result.recognizedIds).toContain('NR_132318')
    expect(result.recognizedIds).toContain('HGNC:10848')
  })

  test('does not include gene symbol as recognized ID', () => {
    const feature = new SimpleFeature({
      uniqueId: 'gene-SHH',
      refName: 'chr7',
      start: 155799980,
      end: 155812463,
      ID: 'SHH',
      gene_id: 'SHH',
      name: 'SHH',
    })
    const result = extractFeatureIdentifiers(feature)

    // SHH should not be in recognizedIds (it's not a database ID)
    expect(result.recognizedIds).not.toContain('SHH')

    // But should still be available as geneName
    expect(result.geneName).toBe('SHH')
  })

  test('handles Ensembl gene IDs', () => {
    const feature = new SimpleFeature({
      uniqueId: 'gene-ENSG00000164690',
      refName: 'chr7',
      start: 155799980,
      end: 155812463,
      ID: 'ENSG00000164690',
      gene_id: 'ENSG00000164690',
      gene_name: 'SHH',
    })
    const result = extractFeatureIdentifiers(feature)

    expect(result.recognizedIds).toContain('ENSG00000164690')
    expect(result.geneName).toBe('SHH')
  })

  test('handles Ensembl transcript IDs with version', () => {
    const feature = new SimpleFeature({
      uniqueId: 'transcript-ENST00000297261.8',
      refName: 'chr7',
      start: 155799980,
      end: 155812463,
      ID: 'ENST00000297261.8',
      transcript_id: 'ENST00000297261.8',
      gene_id: 'ENSG00000164690',
      gene_name: 'SHH',
    })
    const result = extractFeatureIdentifiers(feature)

    // Should strip version from Ensembl transcript ID
    expect(result.recognizedIds).toContain('ENST00000297261')
    expect(result.recognizedIds).toContain('ENSG00000164690')
  })

  test('deduplicates IDs when same ID appears in multiple attributes', () => {
    const feature = new SimpleFeature({
      uniqueId: 'test-dedup',
      refName: 'chr7',
      start: 155799980,
      end: 155809163,
      ID: 'NM_001310462.2',
      transcript_id: 'NM_001310462.2',
      id: 'NM_001310462.2',
      mrnaAcc: 'NM_001310462.2',
    })
    const result = extractFeatureIdentifiers(feature)

    // Should only have one instance of NM_001310462
    const nmCount = result.recognizedIds.filter(
      id => id === 'NM_001310462',
    ).length
    expect(nmCount).toBe(1)
  })

  test('extracts UniProt ID from uniprot attribute', () => {
    const feature = new SimpleFeature({
      uniqueId: 'test-uniprot',
      refName: 'chr7',
      start: 155799980,
      end: 155809163,
      ID: 'NM_001310462.2',
      uniprot: 'Q15465',
      gene_id: 'SHH',
    })
    const result = extractFeatureIdentifiers(feature)
    expect(result.uniprotId).toBe('Q15465')
  })

  test('extracts UniProt ID from uniprotId attribute', () => {
    const feature = new SimpleFeature({
      uniqueId: 'test-uniprotId',
      refName: 'chr7',
      start: 155799980,
      end: 155809163,
      uniprotId: 'P12345',
    })
    const result = extractFeatureIdentifiers(feature)
    expect(result.uniprotId).toBe('P12345')
  })

  test('extracts UniProt ID from uniprotid attribute (lowercase)', () => {
    const feature = new SimpleFeature({
      uniqueId: 'test-uniprotid',
      refName: 'chr7',
      start: 155799980,
      end: 155809163,
      uniprotid: 'A0A0A0MRZ7',
    })
    const result = extractFeatureIdentifiers(feature)
    expect(result.uniprotId).toBe('A0A0A0MRZ7')
  })
})
