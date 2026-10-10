import {
  meanScoreByPosition,
  pathogenicCountByPosition,
} from './variantEffects'
import { parseAlphaMissense } from '../AlphaMissensePathogenicityAdapter/parseAlphaMissense'

import type {
  UniProtValues,
  VariantEffectScheme,
  VariationEntry,
} from './variantEffects'

function variantEffectUrl(scheme: VariantEffectScheme, accession: string) {
  return scheme === 'alphamissense'
    ? `https://alphafold.ebi.ac.uk/files/AF-${accession}-F1-aa-substitutions.csv`
    : `https://www.ebi.ac.uk/proteins/api/variation/${accession}.json`
}

function isVariationEntry(value: unknown): value is VariationEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    'features' in value &&
    Array.isArray(value.features)
  )
}

// TP53's variation record is 14 MB; a stalled EBI should not leave a
// structure waiting on it for good
const DOWNLOAD_TIMEOUT_MS = 60_000

async function download(scheme: VariantEffectScheme, accession: string) {
  const response = await fetch(variantEffectUrl(scheme, accession), {
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  if (scheme === 'alphamissense') {
    return meanScoreByPosition(parseAlphaMissense(await response.text()))
  }
  const entry: unknown = await response.json()
  if (!isVariationEntry(entry)) {
    throw new Error('the variation record lists no features')
  }
  return pathogenicCountByPosition(entry)
}

const cache = new Map<string, Promise<UniProtValues>>()

/**
 * An entry's per-position values, downloaded once per accession and source
 * for every structure and view of the page. A failure is forgotten, so the
 * next request tries again.
 */
export function fetchVariantEffects(
  scheme: VariantEffectScheme,
  accession: string,
): Promise<UniProtValues> {
  const key = `${scheme}:${accession}`
  let values = cache.get(key)
  if (!values) {
    values = download(scheme, accession)
    values.catch(() => {
      cache.delete(key)
    })
    cache.set(key, values)
  }
  return values
}
