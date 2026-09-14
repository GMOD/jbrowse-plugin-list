import { stripStopCodon } from '../utils/util'

import type { IsoformSequences } from '../utils/util'

export interface AlphaFoldModel {
  /** UniProt accession, with an isoform suffix on an isoform model */
  accession: string
  url: string
  confidenceUrl?: string
  sequence: string
}

interface PredictionEntry {
  uniprotAccession?: unknown
  cifUrl?: unknown
  plddtDocUrl?: unknown
  sequence?: unknown
}

function isPredictionEntry(value: unknown): value is PredictionEntry {
  return typeof value === 'object' && value !== null
}

export function parseAlphaFoldModels(json: unknown): AlphaFoldModel[] {
  return (Array.isArray(json) ? json : []).flatMap(e =>
    isPredictionEntry(e) &&
    typeof e.uniprotAccession === 'string' &&
    typeof e.cifUrl === 'string' &&
    typeof e.sequence === 'string'
      ? [
          {
            accession: e.uniprotAccession,
            url: e.cifUrl,
            confidenceUrl:
              typeof e.plddtDocUrl === 'string' ? e.plddtDocUrl : undefined,
            sequence: e.sequence,
          },
        ]
      : [],
  )
}

/**
 * Every model AlphaFold DB has for an accession: the canonical one and any
 * isoform models, each with its file url and sequence. Asked rather than
 * derived from the accession, because a derived `AF-<acc>-F1-model_v6` does
 * not exist past the length cap (dystrophin has fourteen isoform models and no
 * F1) and moves with every model version. An accession AlphaFold has never
 * folded answers 400 or 404, which is no models rather than an error.
 */
export async function fetchAlphaFoldModels(uniprotId: string) {
  const res = await fetch(
    `https://alphafold.ebi.ac.uk/api/prediction/${encodeURIComponent(uniprotId)}`,
  )
  if (res.status === 400 || res.status === 404) {
    return []
  }
  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} asking AlphaFold DB for ${uniprotId}'s models`,
    )
  }
  return parseAlphaFoldModels(await res.json())
}

/**
 * The model to open for a gene's transcripts: one folded from exactly a
 * transcript's translation, canonical first, so the view maps it as an
 * identity; else the canonical model; else the longest isoform model.
 */
export function pickAlphaFoldModel(
  models: AlphaFoldModel[],
  isoformSequences: IsoformSequences | undefined,
) {
  const translations = new Set(
    Object.values(isoformSequences ?? {}).map(v => stripStopCodon(v.seq)),
  )
  const canonicalFirst = [...models].sort(
    (a, b) =>
      Number(a.accession.includes('-')) - Number(b.accession.includes('-')),
  )
  return (
    canonicalFirst.find(m => translations.has(m.sequence)) ??
    canonicalFirst.find(m => !m.accession.includes('-')) ??
    [...models].sort((a, b) => b.sequence.length - a.sequence.length)[0]
  )
}
