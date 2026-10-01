import { readStorage, writeStorage } from '../../storage';
// Self-contained launch preference (NOT the global/core preferences system):
// whether a protein view launched from a genome feature opens side-by-side with
// its connected genome view (left genome | right protein) instead of stacked.
const SIDE_BY_SIDE_KEY = 'proteinView-launchSideBySide';
// Default to side-by-side: a connected genome+protein pair reads best as a
// left/right split. Users can turn it off in the launch dialog's settings.
const DEFAULT_SIDE_BY_SIDE = true;
export function getLaunchSideBySide() {
    const stored = readStorage(SIDE_BY_SIDE_KEY);
    return stored === undefined ? DEFAULT_SIDE_BY_SIDE : stored === 'true';
}
export function setLaunchSideBySide(value) {
    writeStorage(SIDE_BY_SIDE_KEY, value ? 'true' : 'false');
}
const hasAction = (session, name) => name in session &&
    typeof session[name] === 'function';
// Warned at most once: this is a property of the host, so it is the same answer
// every launch, and a dialog the user reopens should not stack up console noise.
let warnedPartial = false;
function isSessionWithWorkspaces(session) {
    const canEnable = hasAction(session, 'setUseWorkspaces');
    const canPlace = hasAction(session, 'setPendingMove');
    // Missing BOTH is an embedded session, with no workspaces to ask for. Missing
    // ONE means the host moved the action out from under us: jbrowse-web once
    // folded `setPendingMove` into its layout `init`, and the views quietly
    // stacked for weeks, so that shape warns.
    if (canEnable !== canPlace && !warnedPartial) {
        warnedPartial = true;
        console.warn(`jbrowse-plugin-protein3d: this session supports workspaces but not ` +
            `${canPlace ? 'setUseWorkspaces' : 'setPendingMove'}, so the ` +
            `side-by-side launch was skipped and the views will stack. The session ` +
            `API moved and the plugin needs updating to match.`);
    }
    return canEnable && canPlace;
}
/**
 * Place a freshly-added view to the right of the others in a workspaces (tiled)
 * layout. Mirrors the "Move to split view" view-menu action: queue a splitRight
 * pending move for this view, then enable workspaces so TiledViewsContainer
 * consumes the move on mount (other views land in the left panel, this one in a
 * new right panel). No-op on sessions without workspaces support.
 */
export function launchViewSideBySide(session, viewId) {
    if (isSessionWithWorkspaces(session)) {
        session.setPendingMove({ type: 'splitRight', viewId });
        session.setUseWorkspaces(true);
    }
}
/**
 * Apply the side-by-side split honoring an explicit override, falling back to
 * the launch-dialog localStorage preference when undefined.
 */
export function maybeLaunchSideBySide(session, viewId, sideBySide) {
    if (sideBySide ?? getLaunchSideBySide()) {
        launchViewSideBySide(session, viewId);
    }
}
