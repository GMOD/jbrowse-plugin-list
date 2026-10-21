import { resolveGeneNameLaunch } from './findGeneByName'
import { resolveShortLaunch } from './resolveShortLaunch'

import type {
  ConnectedViewSpec,
  ResolvedShortLaunch,
} from './resolveShortLaunch'
import type { AbstractSessionModel } from '@jbrowse/core/util'

interface TranscriptLinkageSpec {
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

interface GenomeViewHost<V extends { id: string }> {
  views: V[]
  addView(typeName: string, initialState: Record<string, unknown>): V
  removeView(view: V): void
}

/**
 * Opens a view linked to a genome view, which is `connectedViewId` or, given
 * a `connectedView` instead, a LinearGenomeView the launch creates itself: a
 * session spec launches each view with an auto-generated id, so it cannot
 * cross-reference one by id. When `open` throws, the launch removes a genome
 * view it created, so a failed launch leaves the session as it found it.
 */
export async function withConnectedGenomeView<V extends { id: string }, T>(
  session: GenomeViewHost<V>,
  {
    connectedViewId,
    connectedView,
  }: { connectedViewId?: string; connectedView?: ConnectedViewSpec },
  open: (
    connectedViewId: string | undefined,
    ownsConnectedView: boolean,
  ) => Promise<T>,
) {
  const created =
    connectedViewId || !connectedView
      ? undefined
      : session.addView('LinearGenomeView', {
          ...connectedView,
          type: 'LinearGenomeView',
        })
  try {
    return await open(connectedViewId ?? created?.id, !!created)
  } catch (e) {
    if (created && session.views.includes(created)) {
      session.removeView(created)
    }
    throw e
  }
}
