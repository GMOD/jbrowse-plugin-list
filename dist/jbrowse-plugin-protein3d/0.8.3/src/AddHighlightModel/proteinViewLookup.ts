import type { JBrowsePluginProteinStructureModel } from '../ProteinView/model'
import type { AbstractSessionModel } from '@jbrowse/core/util'

/**
 * What the highlight/hover bridges need from a ProteinView. Declared
 * structurally (like ParentProteinView in structureModel.ts) because the MST
 * Instance type of `structures` widens to a snapshot union at the array
 * boundary, which would force a cast at every call site.
 */
export interface HighlightSourceProteinView {
  id: string
  connectedMsaViewId?: string
  structures: JBrowsePluginProteinStructureModel[]
  primaryStructure?: JBrowsePluginProteinStructureModel
}

export function getProteinViews(
  session: AbstractSessionModel,
): HighlightSourceProteinView[] {
  return session.views.filter(
    v => v.type === 'ProteinView',
  ) as unknown as HighlightSourceProteinView[]
}

/**
 * NOTE: assumes a single ProteinView. Unlike the genome-highlight bridge (which
 * pairs by the declared `connectedViewId`, see getStructuresConnectedTo), a
 * second ProteinView's MSA hover sync is skipped — pairing an MSA to one of
 * several protein views has no reliable rule when the protein view declares
 * neither a connectedMsaViewId nor a connectedViewId.
 */
export function getProteinView(
  session: AbstractSessionModel,
): HighlightSourceProteinView | undefined {
  return getProteinViews(session)[0]
}

interface ConnectableStructure {
  connectedViewId?: string
}

/**
 * Every structure across all ProteinViews that declares this genome view as its
 * connection. Structures are paired to a genome view explicitly, so a second
 * LinearGenomeView doesn't mirror another view's highlights (the coordinates
 * would be meaningless there, possibly on a different assembly), and a second
 * ProteinView isn't ignored.
 */
export function getStructuresConnectedTo<T extends ConnectableStructure>(
  proteinViews: { structures: T[] }[],
  viewId: string,
): T[] {
  return proteinViews.flatMap(view =>
    view.structures.filter(s => s.connectedViewId === viewId),
  )
}
