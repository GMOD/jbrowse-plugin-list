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

// The workspaces split is driven by two session actions that only exist on the
// web/desktop session (MultipleViews + DockviewLayout mixins). Embedded sessions
// lack them, so feature-detect before using.
interface SessionWithWorkspaces {
  setUseWorkspaces: (useWorkspaces: boolean) => void
  setPendingMove: (move: { type: 'splitRight'; viewId: string }) => void
}

const hasAction = (session: AbstractSessionModel, name: string) =>
  name in session &&
  typeof (session as unknown as Record<string, unknown>)[name] === 'function'

// Warned at most once: this is a property of the host, so it is the same answer
// every launch, and a dialog the user reopens should not stack up console noise.
let warnedPartial = false

function isSessionWithWorkspaces(
  session: AbstractSessionModel,
): session is AbstractSessionModel & SessionWithWorkspaces {
  const canEnable = hasAction(session, 'setUseWorkspaces')
  const canPlace = hasAction(session, 'setPendingMove')

  // Missing BOTH is an embedded session: it has no workspaces, there is nothing
  // to ask for, and silence is the right answer.
  //
  // Missing ONE is a host that has workspaces but places views some other way —
  // and silence there is how this broke before. jbrowse-web folded
  // `setPendingMove` into its layout `init`, this guard went false, and the
  // plugin simply stopped asking for the split: no error, no missing feature,
  // just two views quietly stacking. Nobody noticed for weeks. Feature
  // detection cannot ask the host to announce a change, but it can tell "not
  // supported here" from "supported, and gone".
  //
  // Two very different hosts produce this one shape, and nothing on the session
  // tells them apart, so the message carries both rather than the guess:
  //
  // - Releases through v4.3.0, where placement is `setPendingMoveToSplitRight`,
  //   a module function in @jbrowse/app-core's DockviewContext, not a session
  //   action. Nothing is wrong and nothing needs fixing; this plugin targets v5+
  //   and does not reach for v4's door. Measured 2026-08-17: v4.3.0 and latest
  //   stack, main splits.
  // - A newer host that moved the action out from under us, which is the
  //   regression this warning exists to catch.
  //
  // Do not quiet the first case by sniffing the version. The alarm is only worth
  // having if it fires on a shape it cannot explain, and these two shapes are
  // identical.
  if (canEnable !== canPlace && !warnedPartial) {
    warnedPartial = true
    console.warn(
      `jbrowse-plugin-protein3d: this session supports workspaces but not ` +
        `${canPlace ? 'setUseWorkspaces' : 'setPendingMove'}, so the ` +
        `side-by-side launch was skipped and the views will stack. Expected on ` +
        `releases through v4.3.0, which place views through @jbrowse/app-core ` +
        `instead; on a newer host it means the session API moved and the plugin ` +
        `needs updating to match.`,
    )
  }
  return canEnable && canPlace
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
