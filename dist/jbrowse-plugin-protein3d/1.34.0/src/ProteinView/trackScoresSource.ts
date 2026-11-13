import { readConfObject } from '@jbrowse/core/configuration'
import { codingSpans } from 'p2s_mapper'

import {
  featureFilterLabel,
  numberOfField,
  passesFeatureFilter,
  readFeatureField,
} from './featureFields'
import { countByResidue, scoreByBase, scoreByResidue } from './trackScores'
import { VariantEffectRefusal } from './variantEffects'
import { genomeToTranscriptSeqMapping } from '../mappings'
import { trackConfigNode } from '../trackConfigNode'

import type { FeatureFilter } from './featureFields'
import type { TrackStat } from './proteinColor'
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'

export const DEFAULT_SCORE_FIELD = 'score'

export interface TrackScoresArgs {
  session: AbstractSessionModel
  trackId: string
  stat: TrackStat
  scoreField?: string
  filter?: FeatureFilter
  feature: Feature
  assemblyName: string
  signal?: AbortSignal
}

function number(value: unknown) {
  return typeof value === 'number' ? value : Number.NaN
}

const SEQUENCE_ALLELE = /^[ACGTN]+$/i

/**
 * Whether a VCF record's first base is the padding base VCF writes before an
 * indel: every alternate allele a sequence that keeps REF's first base, with
 * REF reaching past it. That base is unchanged, so it belongs to no residue
 * the record changes. An insertion's REF is the padding base alone, the one
 * place its span touches, so it keeps it.
 */
function startsOnPaddingBase(feature: Feature) {
  const ref: unknown = feature.get('REF')
  const alts: unknown = feature.get('ALT')
  return (
    typeof ref === 'string' &&
    ref.length > 1 &&
    Array.isArray(alts) &&
    alts.length > 0 &&
    alts.every(
      (alt: unknown) =>
        typeof alt === 'string' &&
        SEQUENCE_ALLELE.test(alt) &&
        alt[0]!.toUpperCase() === ref[0]!.toUpperCase(),
    )
  )
}

/**
 * One value per transcript residue from a track's features under its coding
 * bases. `count` gives every residue a value, 0 where no feature falls on its
 * codon, because the request searched every codon; the other stats reduce
 * the number at `scoreField`, and a residue with none has no value. A feature
 * returned for two coding spans counts once, and a VCF indel reads from the
 * base after its padding base. Only features every predicate of `filter`
 * passes are read.
 */
export function trackValuesByResidue({
  features,
  p2gCodon,
  stat,
  scoreField = DEFAULT_SCORE_FIELD,
  filter = [],
  trackId,
}: {
  features: readonly Feature[]
  p2gCodon: Record<number, number[]>
  stat: TrackStat
  scoreField?: string
  filter?: FeatureFilter
  trackId: string
}) {
  const unique = [...new Map(features.map(f => [f.id(), f])).values()]
  if (unique.length === 0) {
    throw new VariantEffectRefusal(
      `Track "${trackId}" has no features under this transcript's coding bases`,
    )
  }
  const kept = unique.filter(f => passesFeatureFilter(f, filter))
  if (kept.length === 0) {
    throw new VariantEffectRefusal(
      `None of track "${trackId}"'s ${unique.length} features under this transcript passes the filter ${featureFilterLabel(filter)}`,
    )
  }
  const intervals = kept.map(f => ({
    start: number(f.get('start')) + (startsOnPaddingBase(f) ? 1 : 0),
    end: number(f.get('end')),
    score: numberOfField(readFeatureField(f, scoreField)),
  }))
  if (stat !== 'count' && !intervals.some(i => Number.isFinite(i.score))) {
    throw new VariantEffectRefusal(
      `Track "${trackId}"'s ${kept.length} ${filter.length > 0 ? 'filtered ' : ''}features under this transcript carry no number in ${scoreField}${
        scoreField === DEFAULT_SCORE_FIELD
          ? '; name the field to read with scoreField, such as INFO.AF, or count the features with stat "count"'
          : ''
      }`,
    )
  }
  return stat === 'count'
    ? countByResidue(intervals, p2gCodon)
    : scoreByResidue(
        p2gCodon,
        scoreByBase(intervals, Object.values(p2gCodon).flat()),
        stat,
      )
}

/**
 * The values of a genome track under each residue of a transcript, over the
 * three bases of its codon. Reads only the transcript's coding spans, in one
 * request, at the track's full resolution.
 */
export async function fetchTrackScores({
  session,
  trackId,
  stat,
  scoreField,
  filter,
  feature,
  assemblyName,
  signal,
}: TrackScoresArgs) {
  const entry = session.getTrackById(trackId)
  const conf = entry ? trackConfigNode(session, entry) : undefined
  if (!conf) {
    throw new VariantEffectRefusal(`This session has no track "${trackId}"`)
  }
  const assembly = await session.assemblyManager.waitForAssembly(assemblyName)
  if (!assembly) {
    throw new Error(`assembly ${assemblyName} not found`)
  }
  const trackAssemblies: unknown = readConfObject(conf, 'assemblyNames')
  const names = new Set([assembly.name, ...assembly.aliases])
  if (
    Array.isArray(trackAssemblies) &&
    !trackAssemblies.some(n => typeof n === 'string' && names.has(n))
  ) {
    throw new VariantEffectRefusal(
      `Track "${trackId}" is on ${trackAssemblies.join(', ')}, not ${assembly.name}`,
    )
  }
  const { p2gCodon, refName } = genomeToTranscriptSeqMapping(feature)
  const positions = Object.keys(p2gCodon).map(Number)
  const spans = codingSpans(p2gCodon, positions)
  const canonical = assembly.getCanonicalRefName(refName) ?? refName
  const features = await session.rpcManager.call(
    'residueValues',
    'CoreGetFeatures',
    // eslint-disable-next-line no-restricted-syntax -- the structure shows the load as variantEffectsPending, which has no place for the worker's phases
    {
      adapterConfig: readConfObject(conf, 'adapter'),
      regions: spans.map(([start, end]) => ({
        assemblyName: assembly.name,
        refName: canonical,
        start,
        end,
      })),
      signal,
    },
  )
  return trackValuesByResidue({
    features,
    p2gCodon,
    stat,
    scoreField,
    filter,
    trackId,
  })
}
