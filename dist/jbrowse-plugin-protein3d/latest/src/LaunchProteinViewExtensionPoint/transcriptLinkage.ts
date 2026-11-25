import { viewAssemblyName } from '../ProteinView/util'
import { resolveGeneNameLaunch } from './findGeneByName'
import { spelledTranscriptKey } from './normalizeLaunch'
import { resolveShortLaunch } from './resolveShortLaunch'

import type {
  ConnectedViewSpec,
  ResolvedShortLaunch,
} from './resolveShortLaunch'
import type {
  AbstractSessionModel,
  SimpleFeatureSerialized,
} from '@jbrowse/core/util'

interface TranscriptLinkageSpec {
  gene?: string
  transcriptId?: string
  uniprotId?: string
  feature?: SimpleFeatureSerialized
  userProvidedTranscriptSequence?: string
  connectedView?: ConnectedViewSpec
  connectedViewId?: string
}

function connectedViewAssembly(
  session: { views: { id: string }[] },
  viewId: string,
) {
  const view = session.views.find(v => v.id === viewId)
  const launching: unknown =
    view && 'launchAssemblyName' in view ? view.launchAssemblyName : undefined
  return typeof launching === 'string'
    ? launching
    : viewAssemblyName(session, viewId)
}

/**
 * The assembly a launch names: the `connectedViewId` view's, which a view
 * still navigating to its launch location already knows, else
 * `connectedView.assembly`, else the session's when it holds only one. A
 * session of several leaves it undefined rather than guessing.
 */
export function launchAssemblyName(
  session: { views: { id: string }[]; assemblyNames: readonly string[] },
  {
    connectedViewId,
    connectedView,
  }: { connectedViewId?: string; connectedView?: ConnectedViewSpec },
) {
  const [only, ...others] = session.assemblyNames
  return (
    (connectedViewId
      ? connectedViewAssembly(session, connectedViewId)
      : undefined) ??
    connectedView?.assembly ??
    (others.length === 0 ? only : undefined)
  )
}

/**
 * The transcript a launch links to and the genome view spec it connects
 * through, shared by every view a spec can link to the genome. A `gene` is
 * looked up through the text search index, which also supplies a genome view
 * on the gene; otherwise a `transcriptId` is found in the `connectedView`'s
 * tracks. A `connectedViewId` keeps the view spec the launch gave. A launch
 * that spells its transcript out has neither looked up. A gene is looked up
 * on the session's first assembly when the launch names none, and the launch
 * then stays on that one. Every failure throws, so a launch never opens
 * half-linked.
 */
export async function resolveTranscriptLinkage(
  session: AbstractSessionModel,
  {
    gene,
    transcriptId,
    uniprotId,
    feature,
    userProvidedTranscriptSequence,
    connectedView: givenConnectedView,
    connectedViewId,
  }: TranscriptLinkageSpec,
  { findStructure }: { findStructure: boolean },
) {
  const spelled = !!spelledTranscriptKey({
    feature,
    userProvidedTranscriptSequence,
  })
  const assemblyName = launchAssemblyName(session, {
    connectedViewId,
    connectedView: givenConnectedView,
  })
  const onAssembly = givenConnectedView && {
    ...givenConnectedView,
    assembly: assemblyName,
  }
  const named =
    gene && !spelled
      ? await resolveGeneNameLaunch({
          session,
          gene,
          transcriptId,
          uniprotId,
          findStructure,
          connectedView: givenConnectedView,
          assemblyName: assemblyName ?? session.assemblyNames[0],
        })
      : undefined
  const connectedView = connectedViewId
    ? givenConnectedView
    : (named?.connectedView ?? onAssembly)
  const resolved: ResolvedShortLaunch | undefined =
    named ??
    (!spelled && transcriptId
      ? await resolveShortLaunch({
          session,
          transcriptId,
          connectedView: onAssembly,
        })
      : undefined)
  return {
    named,
    resolved,
    connectedView,
    assemblyName: named?.connectedView.assembly ?? assemblyName,
  }
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
