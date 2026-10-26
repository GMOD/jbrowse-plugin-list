import type { JBrowsePluginProteinStructureModel } from '../ProteinView/model'
import type { AbstractSessionModel } from '@jbrowse/core/util'

/**
 * What the highlight/hover bridges need from a ProteinView. Declared
 * structurally (like ParentProteinView in structureModel.ts) because the MST
 * Instance type of `structures` widens to a snapshot union at the array
 * boundary.
 */
export interface HighlightSourceProteinView {
  id: string
  structures: JBrowsePluginProteinStructureModel[]
}

type SessionView = AbstractSessionModel['views'][number]

function isProteinView(
  v: SessionView,
): v is SessionView & HighlightSourceProteinView {
  return v.type === 'ProteinView' && 'structures' in v
}

export function getProteinViews(
  session: AbstractSessionModel,
): HighlightSourceProteinView[] {
  return session.views.filter(isProteinView)
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
