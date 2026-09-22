import { placeMsaView } from './workspaces';
/**
 * The one place a launch adds an MSA view -- the dialog's four tabs, the Add
 * menu, and the `LaunchView-MsaView` extension point a session spec arrives on
 * all come through here. Each of them used to run its own `addView` and none
 * placed the result, which is how a launch from a gene feature landed stacked
 * under the very genome view it was connected to.
 */
export function launchMsaView(session, { placement = 'stack', ...snapshot }) {
    const view = session.addView('MsaView', { type: 'MsaView', ...snapshot });
    placeMsaView(session, view.id, placement);
    return view;
}
