import { readConfObject } from '@jbrowse/core/configuration'
import { parseLocString } from '@jbrowse/core/util'

import { fetchProteinSeq } from '../LaunchProteinView/utils/calculateProteinSequence'
import {
  getTranscriptFeatures,
  stripTrailingVersion,
} from '../LaunchProteinView/utils/util'

import type { AnyConfigurationModel } from '@jbrowse/core/configuration'
import type {
  AbstractSessionModel,
  Feature,
  SimpleFeatureSerialized,
} from '@jbrowse/core/util'

export interface ConnectedViewSpec {
  loc?: string
  assembly?: string
  tracks?: (string | Record<string, unknown>)[]
}

export interface ResolvedShortLaunch {
  url: string
  feature: SimpleFeatureSerialized
  userProvidedTranscriptSequence: string
}

function getTrackId(track: string | Record<string, unknown>) {
  if (typeof track === 'string') {
    return track
  }
  const { trackId } = track
  return typeof trackId === 'string' ? trackId : undefined
}

/**
 * Track config for a trackId, reading whichever lookup this host has. Hosts are
 * not all current: a hub config lives at one permanent url that desktop installs
 * and published links keep naming, so this runs on builds years apart.
 * `getTrackById` landed 2026-07 and `getTracksById` 2026-01, while a session's
 * own `tracks` array has been there throughout — measured floor for the whole
 * short-form launch was v4.2.0 when this only called `getTracksById()`, purely
 * because of that one call. Probe it with
 * `pnpm host-compat -- --floor <version>`.
 */
function findTrackConf(session: AbstractSessionModel, trackId: string) {
  const host: {
    getTrackById?: (id: string) => AnyConfigurationModel | undefined
    getTracksById?: () => Record<string, AnyConfigurationModel>
    tracks?: AnyConfigurationModel[]
  } = session
  return (
    host.getTrackById?.(trackId) ??
    host.getTracksById?.()[trackId] ??
    host.tracks?.find(t => readConfObject(t, 'trackId') === trackId)
  )
}

function transcriptMatches(transcript: Feature, transcriptId: string) {
  const target = stripTrailingVersion(transcriptId)
  return [transcript.get('name'), transcript.get('id'), transcript.id()].some(
    candidate =>
      typeof candidate === 'string' &&
      (candidate === transcriptId ||
        stripTrailingVersion(candidate) === target),
  )
}

/**
 * Headless counterpart of the interactive AlphaFoldDBSearch → TranscriptSelector
 * flow. Given a `uniprotId`, a `transcriptId`, and a connected genome view spec,
 * it derives the three things a ProteinView structure needs: the AlphaFold
 * structure URL, the transcript `feature` (for the genome↔protein mapping), and
 * the translated protein sequence (for the alignment). Every failure throws with
 * a descriptive message so the caller can surface it — nothing degrades silently
 * to an unlinked structure.
 */
export async function resolveShortLaunch({
  session,
  structureUrl,
  transcriptId,
  connectedView,
}: {
  session: AbstractSessionModel
  /** already resolved from the uniprotId/pdbId shorthand by the caller */
  structureUrl: string
  transcriptId?: string
  connectedView?: ConnectedViewSpec
}): Promise<ResolvedShortLaunch> {
  if (!transcriptId) {
    throw new Error(
      'transcriptId is required to launch from a uniprotId or pdbId',
    )
  }
  const assemblyName = connectedView?.assembly
  const loc = connectedView?.loc
  const trackSpecs = connectedView?.tracks ?? []
  if (!assemblyName || !loc) {
    throw new Error(
      'connectedView with assembly + loc is required to launch from a uniprotId',
    )
  }

  const assembly = await session.assemblyManager.waitForAssembly(assemblyName)
  if (!assembly) {
    throw new Error(`assembly "${assemblyName}" not found`)
  }

  const parsed = parseLocString(loc, refName =>
    assembly.isValidRefName(refName),
  )
  if (parsed.start === undefined || parsed.end === undefined) {
    throw new Error(`could not parse a start-end region from loc "${loc}"`)
  }
  const region = {
    assemblyName,
    refName: assembly.getCanonicalRefName(parsed.refName) ?? parsed.refName,
    start: parsed.start,
    end: parsed.end,
  }

  const trackIds = trackSpecs.map(getTrackId).filter(t => t !== undefined)
  const sessionId = 'getFeatures'
  const transcripts: Feature[] = []
  for (const trackId of trackIds) {
    const trackConf = findTrackConf(session, trackId)
    if (!trackConf) {
      continue
    }
    const feats = (await session.rpcManager.call(sessionId, 'CoreGetFeatures', {
      adapterConfig: readConfObject(trackConf, 'adapter'),
      sessionId,
      regions: [region],
    })) as Feature[]
    for (const feat of feats) {
      transcripts.push(...getTranscriptFeatures(feat))
    }
  }

  const transcript = transcripts.find(f => transcriptMatches(f, transcriptId))
  if (!transcript) {
    throw new Error(
      `transcript "${transcriptId}" not found at ${loc} in tracks [${trackIds.join(', ')}]`,
    )
  }
  const hasCds = (transcript.get('subfeatures') ?? []).some(
    (sub: Feature) => sub.get('type') === 'CDS',
  )
  if (!hasCds) {
    throw new Error(`transcript "${transcriptId}" has no CDS subfeatures`)
  }

  const userProvidedTranscriptSequence = await fetchProteinSeq({
    session,
    assemblyName,
    feature: transcript,
  })
  if (!userProvidedTranscriptSequence) {
    throw new Error(
      `could not translate a protein sequence for "${transcriptId}"`,
    )
  }

  return {
    url: structureUrl,
    feature: transcript.toJSON(),
    userProvidedTranscriptSequence,
  }
}
