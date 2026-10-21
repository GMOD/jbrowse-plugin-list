import { SimpleFeature } from '@jbrowse/core/util'

import { clinVarBuild, isUnnumberedMitochondrion } from './clinVar'
import { fetchTrackScores } from './trackScoresSource'
import {
  VARIANT_EFFECT_SOURCE_NAMES,
  meanScoreByPosition,
} from './variantEffects'
import { parseAlphaMissense } from '../AlphaMissensePathogenicityAdapter/parseAlphaMissense'

import type { ClinVarBuild } from './clinVar'
import type { TrackStat } from './proteinColor'
import type { VariantEffectAsk } from './variantEffectLoader'
import type { VariantEffectValues } from './variantEffects'
import type {
  AbstractSessionModel,
  SimpleFeatureSerialized,
} from '@jbrowse/core/util'

/**
 * What a structure asks a variant-effect source for: AlphaMissense by the
 * UniProt entry it scores, ClinVar by the transcript whose genome it reads.
 * `key` names the answer in the page-wide cache and tells a stale answer from
 * a current one; `label` names the request in a message.
 */
export type VariantEffectRequest = {
  key: string
  label: string
} & (
  | { scheme: 'alphamissense'; accession: string }
  | {
      scheme: 'clinvar'
      build: ClinVarBuild
      assemblyName: string
      feature: SimpleFeatureSerialized
    }
  | {
      scheme: 'genome-track'
      trackId: string
      stat: TrackStat
      assemblyName: string
      feature: SimpleFeatureSerialized
    }
)

/**
 * AlphaMissense scores a UniProt entry, so a PDB entry waits for SIFTS to name
 * one. An isoform model is numbered for the isoform while the scores number
 * the entry, so it asks nothing.
 */
export function alphaMissenseAsk({
  uniprotId,
  isoformAccession,
  isLoading,
}: {
  uniprotId: string | undefined
  isoformAccession?: string
  isLoading: boolean
}): VariantEffectAsk {
  const source = VARIANT_EFFECT_SOURCE_NAMES.alphamissense
  return isLoading
    ? { status: 'waiting' }
    : isoformAccession
      ? {
          status: 'unavailable',
          reason: `${source} are numbered for the canonical entry, not isoform ${isoformAccession}`,
        }
      : uniprotId
        ? {
            status: 'ready',
            request: {
              scheme: 'alphamissense',
              key: `alphamissense:${uniprotId}`,
              label: uniprotId,
              accession: uniprotId,
            },
          }
        : {
            status: 'unavailable',
            reason: `No UniProt entry to place ${source} on`,
          }
}

/**
 * ClinVar is read off the genome under the structure's transcript, so it needs
 * the transcript and the assembly the genome view shows it on, which NCBI has
 * to publish a VCF for. `assemblyNames` are that assembly's names and aliases.
 */
export function clinVarAsk({
  feature,
  assemblyName,
  assemblyNames,
}: {
  feature: SimpleFeatureSerialized | undefined
  assemblyName: string | undefined
  assemblyNames: readonly string[]
}): VariantEffectAsk {
  const source = VARIANT_EFFECT_SOURCE_NAMES.clinvar
  const build = clinVarBuild(assemblyNames)
  if (!feature) {
    return {
      status: 'unavailable',
      reason: `No transcript to place ${source} on`,
    }
  }
  if (!assemblyName) {
    return {
      status: 'unavailable',
      reason: `No genome view to read ${source} on`,
    }
  }
  if (!build) {
    return {
      status: 'unavailable',
      reason: `NCBI publishes ${source} on GRCh38 and GRCh37, not ${assemblyName}`,
    }
  }
  const { refName, start, end, uniqueId } = feature
  if (isUnnumberedMitochondrion(refName, build)) {
    return {
      status: 'unavailable',
      reason: `${assemblyName}'s ${refName} is NC_001807, not the rCRS mitochondrion ClinVar's GRCh37 VCF numbers`,
    }
  }
  const name = [feature.name, feature.id].find(n => typeof n === 'string')
  return {
    status: 'ready',
    request: {
      scheme: 'clinvar',
      key: `clinvar:${build}:${assemblyName}:${refName}:${start}-${end}:${uniqueId}`,
      label: name ?? `${refName}:${start + 1}-${end}`,
      build,
      assemblyName,
      feature,
    },
  }
}

/**
 * A genome track is read under the transcript's codons on the connected genome
 * view's assembly, so it needs the transcript and that view. `trackName`
 * labels the request in a message.
 */
export function genomeTrackAsk({
  trackId,
  trackName,
  stat,
  feature,
  assemblyName,
}: {
  trackId: string | undefined
  trackName: string | undefined
  stat: TrackStat
  feature: SimpleFeatureSerialized | undefined
  assemblyName: string | undefined
}): VariantEffectAsk {
  const source = VARIANT_EFFECT_SOURCE_NAMES['genome-track']
  if (!trackId) {
    return { status: 'unavailable', reason: 'No genome track is chosen' }
  }
  if (!feature) {
    return {
      status: 'unavailable',
      reason: `No transcript to place ${source} on`,
    }
  }
  if (!assemblyName) {
    return {
      status: 'unavailable',
      reason: `No genome view to read ${source} on`,
    }
  }
  const { refName, start, end, uniqueId } = feature
  return {
    status: 'ready',
    request: {
      scheme: 'genome-track',
      key: `genome-track:${assemblyName}:${trackId}:${stat}:${refName}:${start}-${end}:${uniqueId}`,
      label: trackName ?? trackId,
      trackId,
      stat,
      assemblyName,
      feature,
    },
  }
}

// TP53's ClinVar slice is under 1 MB, but a stalled host should not leave a
// structure waiting on it for good
const DOWNLOAD_TIMEOUT_MS = 60_000

/**
 * Runs `task` against a timeout. The signal reaches the fetches, but not an
 * assembly load or the genome sequence RPC, so the whole task races it too.
 */
export function withTimeout<T>(
  task: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const signal = AbortSignal.timeout(timeoutMs)
  return Promise.race([
    task(signal),
    new Promise<never>((_, reject) => {
      signal.addEventListener('abort', () => {
        reject(new Error(`no answer in ${timeoutMs / 1000} s`))
      })
    }),
  ])
}

async function load(
  request: VariantEffectRequest,
  session: AbstractSessionModel,
  signal: AbortSignal,
): Promise<VariantEffectValues> {
  if (request.scheme === 'genome-track') {
    return {
      numbering: 'transcript',
      byPosition: await fetchTrackScores({
        session,
        trackId: request.trackId,
        stat: request.stat,
        feature: new SimpleFeature(request.feature),
        assemblyName: request.assemblyName,
        signal,
      }),
    }
  }
  if (request.scheme === 'alphamissense') {
    const response = await fetch(
      `https://alphafold.ebi.ac.uk/files/AF-${request.accession}-F1-aa-substitutions.csv`,
      { signal },
    )
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return meanScoreByPosition(parseAlphaMissense(await response.text()))
  }
  const { fetchClinVarCounts } = await import('./clinVarSource')
  return {
    numbering: 'transcript',
    byPosition: await fetchClinVarCounts({
      build: request.build,
      feature: new SimpleFeature(request.feature),
      assemblyName: request.assemblyName,
      session,
      signal,
    }),
  }
}

interface CacheEntry {
  values: Promise<VariantEffectValues>
  controller: AbortController
  waiters: number
  settled: boolean
}

const cache = new Map<string, CacheEntry>()

/**
 * A request's values, fetched once per key for every structure and view of
 * the page. A failure is forgotten, so the next request tries again. The
 * download stops once every caller's `signal` has aborted and it is still
 * running, and the next request for the key starts afresh.
 */
export function fetchVariantEffects(
  request: VariantEffectRequest,
  session: AbstractSessionModel,
  signal?: AbortSignal,
): Promise<VariantEffectValues> {
  let entry = cache.get(request.key)
  if (!entry) {
    const controller = new AbortController()
    const created: CacheEntry = {
      values: withTimeout(
        timeout =>
          load(request, session, AbortSignal.any([timeout, controller.signal])),
        DOWNLOAD_TIMEOUT_MS,
      ),
      controller,
      waiters: 0,
      settled: false,
    }
    const forget = () => {
      created.settled = true
      if (cache.get(request.key) === created) {
        cache.delete(request.key)
      }
    }
    created.values.then(() => {
      created.settled = true
    }, forget)
    cache.set(request.key, created)
    entry = created
  }
  const waiting = entry
  waiting.waiters++
  signal?.addEventListener(
    'abort',
    () => {
      waiting.waiters--
      if (waiting.waiters === 0 && !waiting.settled) {
        waiting.controller.abort()
        if (cache.get(request.key) === waiting) {
          cache.delete(request.key)
        }
      }
    },
    { once: true },
  )
  return waiting.values
}
