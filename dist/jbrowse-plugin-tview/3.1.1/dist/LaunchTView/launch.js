import { assembleLocString } from '@jbrowse/core/util';
import { checkRegion } from '../TViewPanel/init';
export function isGenomeView(view) {
    return 'visibleWholeBaseRegions' in view && 'tracks' in view;
}
export function alignmentsTrackIds(tracks) {
    return tracks
        .filter(track => track.displays.some(d => d.type === 'LinearAlignmentsDisplay'))
        .map(track => track.configuration.trackId);
}
/**
 * The locus a tview over `regions` would show, or why there is none. The width
 * and contig rules are {@link checkRegion}'s, so a menu offers exactly what the
 * view would then agree to load.
 */
export function regionLaunch(session, regions) {
    const [region] = regions;
    const assembly = region
        ? session.assemblyManager.get(region.assemblyName)
        : undefined;
    const loc = region
        ? assembleLocString({
            refName: region.refName,
            start: region.start,
            end: region.end,
        })
        : '';
    const check = assembly?.initialized ? checkRegion(assembly, loc) : undefined;
    return !region
        ? { reason: 'No region is in view' }
        : regions.length > 1
            ? { reason: 'Spans more than one region' }
            : !check
                ? { reason: `Assembly ${region.assemblyName} is not loaded` }
                : check.error !== undefined
                    ? { reason: check.error }
                    : { assembly: region.assemblyName, loc };
}
export function launchTView(session, { assembly, loc, tracks, connectedViewId }, viewProps = {}) {
    return session.addView('TView', {
        displayName: loc,
        connectedViewId,
        ...viewProps,
        type: 'TView',
        init: { assembly, loc, tracks },
    });
}
//# sourceMappingURL=launch.js.map