import { readConfObject } from '@jbrowse/core/configuration'
import { parseLocString } from '@jbrowse/core/util'

import {
  getTrackId,
  isFeatureTrack,
  transcriptMatches,
} from './resolveShortLaunch'
import {
  codingTranscripts,
  isCodingFeature,
} from '../LaunchProteinView/codingFeature'
import {
  resolveGeneLaunch,
  sessionGeneLaunchHost,
} from '../LaunchProteinView/resolveGeneLaunch'
import { formatViewName } from '../LaunchProteinView/utils/launchViewUtils'

import type { ConnectedViewSpec } from './resolveShortLaunch'
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'

export interface FoundGene {
  feature: Feature
  trackId: string
}

const GENE_NAME_ATTRIBUTES = ['gene_name', 'gene', 'name', 'id', 'gene_id']

function isNamed(feature: Feature, name: string) {
  return GENE_NAME_ATTRIBUTES.some(attribute => {
    const value: unknown = feature.get(attribute)
    return typeof value === 'string' && value.toLowerCase() === name
  })
}

// A text index lists a hit per indexed feature, so a search for TP53 answers
// with the gene and, where the transcripts carry its name, each of them too.
// The gene is the one whose own attributes, or whose transcripts', say so.
function geneNamed(features: Feature[], name: string) {
  return features.find(
    f =>
      isCodingFeature(f) &&
      (isNamed(f, name) || codingTranscripts(f).some(t => isNamed(t, name))),
  )
}

/**
 * What a spec naming only a gene launches: the gene's transcript and
 * translation, the AlphaFold model of its UniProt entry, and a genome view on
 * the gene with the track the index found it in. A `connectedView` the spec
 * carries keeps its own `loc` and `tracks`.
 */
export async function resolveGeneNameLaunch({
  session,
  gene,
  transcriptId,
  uniprotId,
  findStructure,
  connectedView,
}: {
  session: AbstractSessionModel
  gene: string
  transcriptId?: string
  uniprotId?: string
  findStructure?: boolean
  connectedView?: ConnectedViewSpec
}) {
  const assemblyName = connectedView?.assembly ?? session.assemblyNames[0]
  if (!assemblyName) {
    throw new Error('no assembly to look the gene up on')
  }
  const { feature, trackId } = await findGeneByName({
    session,
    gene,
    assemblyName,
    trackIds: (connectedView?.tracks ?? [])
      .map(getTrackId)
      .filter(t => t !== undefined),
  })
  const preferred = transcriptId
    ? codingTranscripts(feature).find(t => transcriptMatches(t, transcriptId))
    : undefined
  if (transcriptId && !preferred) {
    throw new Error(`transcript "${transcriptId}" not found in ${gene}`)
  }
  const launch = await resolveGeneLaunch({
    host: sessionGeneLaunchHost(session, assemblyName),
    feature,
    preferredTranscriptId: preferred?.id(),
    uniprotId,
    findStructure,
  })
  return {
    feature: launch.transcript.toJSON(),
    userProvidedTranscriptSequence: launch.userProvidedTranscriptSequence,
    uniprotId: launch.uniprotId,
    url: launch.url,
    displayName: formatViewName(
      'Protein view',
      feature,
      launch.transcript,
      launch.uniprotId,
    ),
    connectedView: {
      ...connectedView,
      assembly: assemblyName,
      loc:
        connectedView?.loc ??
        `${feature.get('refName')}:${feature.get('start') + 1}-${feature.get('end')}`,
      tracks: connectedView?.tracks ?? [trackId],
    },
  }
}

/**
 * The coding gene a name means on an assembly, through the host's text search
 * index: the same lookup the genome view's search box runs, followed by a
 * fetch of the features under each hit from the track the index names.
 * `trackIds` are searched too, for an index that names no track.
 */
export async function findGeneByName({
  session,
  gene,
  assemblyName,
  trackIds = [],
}: {
  session: AbstractSessionModel
  gene: string
  assemblyName: string
  trackIds?: string[]
}): Promise<FoundGene> {
  const { textSearchManager, assemblyManager, rpcManager } = session
  if (!textSearchManager) {
    throw new Error('this session has no text search to look a gene up with')
  }
  const assembly = await assemblyManager.waitForAssembly(assemblyName)
  if (!assembly) {
    throw new Error(`assembly "${assemblyName}" not found`)
  }
  const hits = await textSearchManager.search(
    { queryString: gene, searchType: 'exact' },
    assemblyName,
  )
  const name = gene.toLowerCase()
  for (const hit of hits) {
    const loc = hit.getLocation()
    const hitTrackId = hit.getTrackId()
    if (loc) {
      const parsed = parseLocString(loc, refName =>
        assembly.isValidRefName(refName),
      )
      const { start, end } = parsed
      if (start !== undefined && end !== undefined) {
        const region = {
          assemblyName,
          refName:
            assembly.getCanonicalRefName(parsed.refName) ?? parsed.refName,
          start,
          end,
        }
        for (const trackId of new Set([
          ...(hitTrackId ? [hitTrackId] : []),
          ...trackIds,
        ])) {
          const conf = session.getTrackById(trackId)
          if (conf && isFeatureTrack(conf)) {
            const feature = geneNamed(
              await rpcManager.call('getFeatures', 'CoreGetFeatures', {
                adapterConfig: readConfObject(conf, 'adapter'),
                regions: [region],
              }),
              name,
            )
            if (feature) {
              return { feature, trackId }
            }
          }
        }
      }
    }
  }
  throw new Error(
    hits.length > 0
      ? `no coding gene named "${gene}" in the tracks the ${assemblyName} search index names`
      : `no search result for "${gene}" on ${assemblyName}; the assembly needs a text search index covering a gene track`,
  )
}
