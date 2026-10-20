import { readStorage, writeStorage } from '../../storage'

import type { AbstractSessionModel } from '@jbrowse/core/util'

// Self-contained launch preference (NOT the global/core preferences system):
// whether a protein view launched from a genome feature opens side-by-side with
// its connected genome view (left genome | right protein) instead of stacked.
const SIDE_BY_SIDE_KEY = 'proteinView-launchSideBySide'

// Default to side-by-side: a connected genome+protein pair reads best as a
// left/right split. Users can turn it off in the launch dialog's settings.
const DEFAULT_SIDE_BY_SIDE = true

export function getLaunchSideBySide() {
  const stored = readStorage(SIDE_BY_SIDE_KEY)
  return stored === undefined ? DEFAULT_SIDE_BY_SIDE : stored === 'true'
}

export function setLaunchSideBySide(value: boolean) {
  writeStorage(SIDE_BY_SIDE_KEY, value ? 'true' : 'false')
}

// The split is a session action that only the web/desktop session has, so
// feature-detect before using. A host whose workspace is always on has
// `moveViewToSplit`, the action its View menu uses; one from before has the
// pair below.
interface SessionWithMoves {
  moveViewToSplit: (viewId: string, direction: 'row' | 'column') => unknown
}

interface SessionWithWorkspaces {
  setUseWorkspaces: (useWorkspaces: boolean) => void
  setPendingMove: (move: { type: 'splitRight'; viewId: string }) => void
}

const hasAction = (session: AbstractSessionModel, name: string) =>
  name in session &&
  typeof (session as unknown as Record<string, unknown>)[name] === 'function'

function isSessionWithMoves(
  session: AbstractSessionModel,
): session is AbstractSessionModel & SessionWithMoves {
  return hasAction(session, 'moveViewToSplit')
}

// Warned at most once: this is a property of the host, so it is the same answer
// every launch, and a dialog the user reopens should not stack up console noise.
let warnedPartial = false

function isSessionWithWorkspaces(
  session: AbstractSessionModel,
): session is AbstractSessionModel & SessionWithWorkspaces {
  const canEnable = hasAction(session, 'setUseWorkspaces')
  const canPlace = hasAction(session, 'setPendingMove')

  // Missing BOTH is an embedded session, with no workspaces to ask for. Missing
  // ONE means the host moved the action out from under us: jbrowse-web once
  // folded `setPendingMove` into its layout `init`, and the views quietly
  // stacked for weeks, so that shape warns.
  if (canEnable !== canPlace && !warnedPartial) {
    warnedPartial = true
    console.warn(
      `jbrowse-plugin-protein3d: this session supports workspaces but not ` +
        `${canPlace ? 'setUseWorkspaces' : 'setPendingMove'}, so the ` +
        `side-by-side launch was skipped and the views will stack. The session ` +
        `API moved and the plugin needs updating to match.`,
    )
  }
  return canEnable && canPlace
}

/**
 * Place a freshly-added view in a cell to the right of its own, the View menu's
 * "Move to split view (right)". No-op on sessions without a workspace.
 */
export function launchViewSideBySide(
  session: AbstractSessionModel,
  viewId: string,
) {
  if (isSessionWithMoves(session)) {
    session.moveViewToSplit(viewId, 'row')
  } else if (isSessionWithWorkspaces(session)) {
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
