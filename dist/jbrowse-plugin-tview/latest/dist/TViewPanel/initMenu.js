import { getSession } from '@jbrowse/core/util';
import { entryTrackId, trackLabel } from './init';
import { alignmentsTrackIds, isGenomeView, regionLaunch, } from '../LaunchTView/launch';
export const TRACKS_LABEL = 'Tracks';
export const CURRENT_REGION_LABEL = "Show the connected view's current region";
/** the alignments tracks open in the genome view, then any others `init` reads */
export function trackChoiceIds(init, openTrackIds) {
    const open = new Set(openTrackIds);
    return [
        ...openTrackIds,
        ...init.tracks.map(entryTrackId).filter(trackId => !open.has(trackId)),
    ];
}
export function withTrack(init, trackId, included) {
    const others = init.tracks.filter(entry => entryTrackId(entry) !== trackId);
    return {
        ...init,
        tracks: included
            ? others.length === init.tracks.length
                ? [...init.tracks, trackId]
                : init.tracks
            : others,
    };
}
export function atRegion(init, { assembly, loc }) {
    return { ...init, assembly, loc };
}
export function initMenuItems({ init, choices, region, setInit, }) {
    const included = new Set(init.tracks.map(entryTrackId));
    return [
        {
            label: TRACKS_LABEL,
            type: 'subMenu',
            subMenu: choices.map(({ trackId, label }) => {
                const checked = included.has(trackId);
                return {
                    label,
                    type: 'checkbox',
                    checked,
                    disabled: checked && included.size === 1,
                    disabledHelpText: 'A tview reads at least one track',
                    onClick: () => {
                        setInit(withTrack(init, trackId, !checked));
                    },
                };
            }),
        },
        {
            label: CURRENT_REGION_LABEL,
            disabled: region.reason !== undefined,
            subLabel: region.reason,
            onClick: () => {
                if (region.reason === undefined) {
                    setInit(atRegion(init, region));
                }
            },
        },
    ];
}
export function tviewInitMenuItems(view) {
    const { init } = view;
    const connectedView = view.connectedView && isGenomeView(view.connectedView)
        ? view.connectedView
        : undefined;
    const session = getSession(view);
    return init
        ? initMenuItems({
            init,
            choices: trackChoiceIds(init, connectedView ? alignmentsTrackIds(connectedView.tracks) : []).map(trackId => ({ trackId, label: trackLabel(session, trackId) })),
            region: connectedView
                ? regionLaunch(session, connectedView.visibleWholeBaseRegions)
                : { reason: 'No connected genome view' },
            setInit: next => {
                view.setInit(next);
            },
        })
        : [];
}
//# sourceMappingURL=initMenu.js.map