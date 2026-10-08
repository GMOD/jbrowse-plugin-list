import { isGeneLikeType } from '@jbrowse/core/util'
import { isRecognizedDatabaseId, matchDbIdPattern } from 'p2s_mapper'

import { isRecord } from './isRecord'
import { codingTranscripts } from '../codingFeature'

import type { Feature } from '@jbrowse/core/util'
import type { Isoform } from 'p2s_mapper'

/**
 * Pull an NCBI taxon id out of reference-sequence-track metadata. jb2hubs
 * assemblies expose it differently by source: UCSC golden-path spreads it flat
 * (`metadata.taxId`), GenArk nests the raw hub stanza (`metadata.ucsc.taxId`).
 * `taxonId` is accepted too. Returns a positive integer, or undefined when
 * absent/unparseable so callers can fall back to a default organism.
 */
export function extractTaxonId(metadata: unknown): number | undefined {
  if (!isRecord(metadata)) {
    return undefined
  }
  const ucsc = isRecord(metadata.ucsc) ? metadata.ucsc : undefined
  const n = Number(metadata.taxId ?? metadata.taxonId ?? ucsc?.taxId)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

function firstString(...vals: unknown[]) {
  return vals.find((v): v is string => typeof v === 'string') ?? ''
}

export function getTranscriptDisplayName(val?: Feature): string {
  return val === undefined ? '' : (val.get('name') ?? val.get('id') ?? '')
}

export function getGeneDisplayName(val?: Feature): string {
  return val === undefined
    ? ''
    : firstString(val.get('gene_name'), val.get('name'), val.get('id'))
}

/**
 * Parse dbxref attribute which can have formats like:
 * - "GeneID:1234,HGNC:HGNC:5678"
 * - "Dbxref=GeneID:1234"
 * - Array of strings
 */
function parseDbxref(dbxref: unknown): string[] {
  const items: unknown[] = Array.isArray(dbxref) ? dbxref : [dbxref]
  return items.flatMap(item =>
    typeof item === 'string' ? item.split(',').map(s => s.trim()) : [],
  )
}

/**
 * Extract recognized database IDs from dbxref entries
 * Returns IDs without their database prefix where applicable
 */
function extractIdsFromDbxref(dbxrefEntries: string[]): string[] {
  const ids: string[] = []
  for (const entry of dbxrefEntries) {
    // Handle formats like "Ensembl:ENST00000123456" or "RefSeq:NM_001234"
    const parts = entry.split(':')
    const lastPart = parts[parts.length - 1]
    if (lastPart && isRecognizedDatabaseId(lastPart)) {
      ids.push(lastPart)
    }
    // Also check if the whole entry is a recognized ID
    if (isRecognizedDatabaseId(entry)) {
      ids.push(entry)
    }
    // Handle HGNC format "HGNC:HGNC:12345" -> "HGNC:12345"
    if (entry.startsWith('HGNC:HGNC:')) {
      ids.push(entry.replace('HGNC:HGNC:', 'HGNC:'))
    } else if (entry.startsWith('HGNC:') && /^HGNC:\d+$/.test(entry)) {
      ids.push(entry)
    }
  }
  return [...new Set(ids)]
}

// New helper function to extract recognized DB IDs
export function findRecognizedDbIds(f?: Feature): string[] {
  if (!f) {
    return []
  }

  const recognizedIds: string[] = []

  // Check various feature attributes for recognized IDs
  const attributesToCheck = [
    f.get('ID'),
    f.get('id'),
    f.get('name'),
    f.get('Name'),
    f.get('transcript_id'),
    f.get('protein_id'),
    f.get('protAcc'), // RefSeq protein accession
    f.get('mrnaAcc'), // RefSeq mRNA accession
  ]

  for (const attr of attributesToCheck) {
    if (typeof attr === 'string') {
      const stripped = attr.replace(/\.[^./]+$/, '') // Strip version
      if (isRecognizedDatabaseId(stripped)) {
        recognizedIds.push(stripped)
      }
    }
  }

  // Handle HGNC attribute which may be just the number (e.g., "10848" instead of "HGNC:10848")
  const hgnc = f.get('hgnc') ?? f.get('HGNC')
  if (typeof hgnc === 'string' || typeof hgnc === 'number') {
    const hgncStr = String(hgnc)
    if (/^\d+$/.test(hgncStr)) {
      recognizedIds.push(`HGNC:${hgncStr}`)
    } else if (matchDbIdPattern(hgncStr)?.db === 'hgnc') {
      recognizedIds.push(hgncStr)
    }
  }

  // Parse dbxref for additional IDs
  const dbxref = f.get('Dbxref') ?? f.get('dbxref') ?? f.get('db_xref')
  const dbxrefIds = extractIdsFromDbxref(parseDbxref(dbxref))
  for (const id of dbxrefIds) {
    recognizedIds.push(id)
  }

  return [...new Set(recognizedIds)]
}

// `UniProtKB/Swiss-Prot:P0A7G6`, the reviewed entry before a TrEMBL one
function dbxrefUniProtId(f?: Feature) {
  const entries = parseDbxref(
    f?.get('Dbxref') ?? f?.get('dbxref') ?? f?.get('db_xref'),
  )
  return ['UniProtKB/Swiss-Prot:', 'UniProtKB/TrEMBL:']
    .flatMap(prefix =>
      entries
        .filter(e => e.startsWith(prefix))
        .map(e => e.slice(prefix.length)),
    )
    .find(id => id.length > 0)
}

export interface FeatureIdentifiers {
  recognizedIds: string[]
  uniprotId?: string
  geneId?: string
  geneName?: string
}

/**
 * Extract all useful identifiers from a feature for UniProt lookup.
 * If the feature is a gene, prioritizes identifiers from the preferred
 * transcript, else its first. Otherwise, extracts identifiers from the feature
 * itself. geneId and geneName are always extracted from the parent feature 'f'.
 */
export function extractFeatureIdentifiers(
  f?: Feature,
  preferredTranscriptId?: string,
): FeatureIdentifiers {
  if (!f) {
    return { recognizedIds: [] }
  }

  let featureToProcess = f // Default to the parent feature

  if (isGeneLikeType(f.get('type'))) {
    const transcripts = codingTranscripts(f)
    featureToProcess =
      transcripts.find(t => t.id() === preferredTranscriptId) ??
      transcripts[0] ??
      f
  }

  // NCBI's GFF3 puts the protein on the CDS record, not the transcript: its
  // RefSeq accession always, and for a curated genome (E. coli K-12, yeast)
  // the UniProt accession itself. A prokaryotic gene has no transcript record
  // between, so the CDS is the only place either appears.
  const cds = featureToProcess
    .get('subfeatures')
    ?.find(sub => sub.get('type')?.toLowerCase() === 'cds')
  const recognizedIds = [
    ...findRecognizedDbIds(featureToProcess),
    ...findRecognizedDbIds(cds),
  ]

  // Handle UniProt ID from feature attributes (trust that it's valid if present)
  const uniprotIdAttr =
    featureToProcess.get('uniprot') ??
    featureToProcess.get('uniprotId') ??
    featureToProcess.get('uniprotid') ??
    featureToProcess.get('UniProt') ??
    dbxrefUniProtId(featureToProcess) ??
    dbxrefUniProtId(cds)
  const uniprotId =
    typeof uniprotIdAttr === 'string' && uniprotIdAttr.length > 0
      ? uniprotIdAttr
      : undefined

  // --- Get gene ID and name as fallbacks from the original parent feature 'f' ---
  // This assumes gene_id and gene_name are attributes of the parent gene, not the transcript.
  const geneId = f.get('gene_id') ?? f.get('ID')
  const geneName =
    f.get('gene_name') ?? f.get('gene') ?? f.get('name') ?? f.get('Name')

  return {
    recognizedIds: [...new Set(recognizedIds)], // Ensure unique IDs
    uniprotId,
    geneId: typeof geneId === 'string' ? geneId : undefined,
    geneName: typeof geneName === 'string' ? geneName : undefined,
  }
}

export interface IsoformSequence {
  feature: Feature
  seq: string
}

export type IsoformSequences = Record<string, IsoformSequence>

/** Every transcript the dialog lists, in its order, carrying whichever
 * translations have arrived — an isoform with none is ranked as `noData`. */
export function rankableIsoforms(
  options: Feature[],
  isoformSequences?: IsoformSequences,
): Isoform[] {
  return options.map(f => ({
    id: f.id(),
    seq: isoformSequences?.[f.id()]?.seq,
  }))
}
