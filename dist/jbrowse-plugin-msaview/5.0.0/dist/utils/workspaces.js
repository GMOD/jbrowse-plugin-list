const PLACEMENTS = ['stack', 'splitRight', 'newTab'];
/**
 * What the dialog does unasked. Side-by-side, because a launch from a gene
 * feature sets `connectedViewId`: the pair shares a hover and a highlight, and
 * reads as a split. A session spec defaults to `stack` instead.
 */
export const DEFAULT_LAUNCH_PLACEMENT = 'splitRight';
export const LAUNCH_PLACEMENT_KEY = 'msaView-launchPlacement';
function hasAction(session, name) {
    return (name in session &&
        typeof session[name] === 'function');
}
// Warned at most once. This is a property of the host, so the answer is the
// same on every launch and a dialog the user reopens should not stack up noise.
let warnedPartial = false;
export function resetWorkspacesWarning() {
    warnedPartial = false;
}
/**
 * Whether this host can honor anything other than `stack`. Silent: the dialog
 * asks on every render, and only a launch is worth warning about.
 */
export function sessionSupportsPlacement(session) {
    return (hasAction(session, 'setUseWorkspaces') &&
        hasAction(session, 'setPendingMove'));
}
function isSessionWithWorkspaces(session) {
    const canEnable = hasAction(session, 'setUseWorkspaces');
    const canPlace = hasAction(session, 'setPendingMove');
    // Missing BOTH is an embedded session, with nothing to ask for. Missing ONE
    // is a host that moved the action out from under us: protein3d once stopped
    // tiling silently for weeks when jbrowse-web folded `setPendingMove` into its
    // layout `init`.
    if (canEnable !== canPlace && !warnedPartial) {
        warnedPartial = true;
        console.warn(`jbrowse-plugin-msaview: this session supports workspaces but not ` +
            `${canPlace ? 'setUseWorkspaces' : 'setPendingMove'}, so the MSA view ` +
            `was stacked instead of tiled: the session API moved and the plugin ` +
            `needs updating to match.`);
    }
    return canEnable && canPlace;
}
/**
 * Put a freshly added view where the launch said to. `stack` is a placement
 * rather than the absence of one, so no caller has to ask what host it is on.
 */
export function placeMsaView(session, viewId, placement) {
    if (placement === 'stack' || !isSessionWithWorkspaces(session)) {
        return;
    }
    session.setPendingMove({ type: placement, viewId });
    // Session-scoped: turning workspaces on for this session leaves the user's
    // own default alone, which is what `setUseWorkspaces` (as against
    // `setUseWorkspacesPreference`) is for.
    session.setUseWorkspaces(true);
}
function isPlacement(value) {
    return PLACEMENTS.includes(value);
}
/**
 * The dialog's own remembered choice — not the host's preferences system, which
 * records whether the user likes workspaces and does not exist everywhere.
 */
export function readLaunchPlacement() {
    try {
        const stored = globalThis.localStorage.getItem(LAUNCH_PLACEMENT_KEY);
        return isPlacement(stored) ? stored : DEFAULT_LAUNCH_PLACEMENT;
    }
    catch (error) {
        console.error(error);
        return DEFAULT_LAUNCH_PLACEMENT;
    }
}
export function writeLaunchPlacement(placement) {
    try {
        globalThis.localStorage.setItem(LAUNCH_PLACEMENT_KEY, placement);
    }
    catch (error) {
        console.error(error);
    }
}
