import type { AbstractSessionModel } from '@jbrowse/core/util'

// Self-contained launch preference (NOT the global/core preferences system):
// whether a protein view launched from a genome feature opens side-by-side with
// its connected genome view (left genome | right protein) instead of stacked.
const SIDE_BY_SIDE_KEY = 'proteinView-launchSideBySide'

// Default to side-by-side: a connected genome+protein pair reads best as a
// left/right split. Users can turn it off in the launch dialog's settings.
const DEFAULT_SIDE_BY_SIDE = true

export function getLaunchSideBySide() {
  const stored = localStorage.getItem(SIDE_BY_SIDE_KEY)
  return stored === null ? DEFAULT_SIDE_BY_SIDE : stored === 'true'
}

export function setLaunchSideBySide(value: boolean) {
  localStorage.setItem(SIDE_BY_SIDE_KEY, value ? 'true' : 'false')
}

// The workspaces split is driven by two session actions that only exist on the
// web/desktop session (MultipleViews + DockviewLayout mixins). Embedded sessions
// lack them, so feature-detect before using.
interface SessionWithWorkspaces {
  setUseWorkspaces: (useWorkspaces: boolean) => void
  setPendingMove: (move: { type: 'splitRight'; viewId: string }) => void
}

function isSessionWithWorkspaces(
  session: AbstractSessionModel,
): session is AbstractSessionModel & SessionWithWorkspaces {
  return (
    'setUseWorkspaces' in session &&
    typeof session.setUseWorkspaces === 'function' &&
    'setPendingMove' in session &&
    typeof session.setPendingMove === 'function'
  )
}

/**
 * Place a freshly-added view to the right of the others in a workspaces (tiled)
 * layout. Mirrors the "Move to split view" view-menu action: queue a splitRight
 * pending move for this view, then enable workspaces so TiledViewsContainer
 * consumes the move on mount (other views land in the left panel, this one in a
 * new right panel). No-op on sessions without workspaces support.
 */
export function launchViewSideBySide(
  session: AbstractSessionModel,
  viewId: string,
) {
  if (isSessionWithWorkspaces(session)) {
    session.setPendingMove({ type: 'splitRight', viewId })
    session.setUseWorkspaces(true)
  }
}

/**
 * Apply the side-by-side split honoring an explicit override, falling back to
 * the launch-dialog localStorage preference when undefined.
 */
export function maybeLaunchSideBySide(
  session: AbstractSessionModel,
  viewId: string,
  sideBySide?: boolean,
) {
  if (sideBySide ?? getLaunchSideBySide()) {
    launchViewSideBySide(session, viewId)
  }
}
