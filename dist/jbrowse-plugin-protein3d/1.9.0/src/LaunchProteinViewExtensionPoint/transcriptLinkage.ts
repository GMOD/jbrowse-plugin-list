import { resolveGeneNameLaunch } from './findGeneByName'
import { resolveShortLaunch } from './resolveShortLaunch'

import type {
  ConnectedViewSpec,
  ResolvedShortLaunch,
} from './resolveShortLaunch'
import type { AbstractSessionModel } from '@jbrowse/core/util'

export interface TranscriptLinkageSpec {
  gene?: string
  transcriptId?: string
  uniprotId?: string
  userProvidedTranscriptSequence?: string
  connectedView?: ConnectedViewSpec
  connectedViewId?: string
}

/**
 * The transcript a launch links to and the genome view spec it connects
 * through, shared by every view a spec can link to the genome. A `gene` is
 * looked up through the text search index, which also supplies a genome view
 * on the gene; otherwise a `transcriptId` is found in the `connectedView`'s
 * tracks. A `connectedViewId` keeps the view spec the launch gave. Every
 * failure throws, so a launch never opens half-linked.
 */
export async function resolveTranscriptLinkage(
  session: AbstractSessionModel,
  {
    gene,
    transcriptId,
    uniprotId,
    userProvidedTranscriptSequence,
    connectedView: givenConnectedView,
    connectedViewId,
  }: TranscriptLinkageSpec,
  { findStructure }: { findStructure: boolean },
) {
  const named =
    gene && !userProvidedTranscriptSequence
      ? await resolveGeneNameLaunch({
          session,
          gene,
          transcriptId,
          uniprotId,
          findStructure,
          connectedView: givenConnectedView,
          connectedViewId,
        })
      : undefined
  const connectedView = connectedViewId
    ? givenConnectedView
    : (named?.connectedView ?? givenConnectedView)
  const resolved: ResolvedShortLaunch | undefined =
    named ??
    (!userProvidedTranscriptSequence && transcriptId
      ? await resolveShortLaunch({ session, transcriptId, connectedView })
      : undefined)
  return { named, resolved, connectedView }
}

/**
 * The genome view a launch links to. A session spec launches each view with
 * an auto-generated id, so it cannot cross-reference one by id; given a
 * `connectedView` instead, the launch creates the LinearGenomeView itself.
 */
export function connectGenomeView(
  session: AbstractSessionModel,
  connectedViewId: string | undefined,
  connectedView: ConnectedViewSpec | undefined,
) {
  return (
    connectedViewId ??
    (connectedView
      ? session.addView('LinearGenomeView', {
          ...connectedView,
          type: 'LinearGenomeView',
        }).id
      : undefined)
  )
}
