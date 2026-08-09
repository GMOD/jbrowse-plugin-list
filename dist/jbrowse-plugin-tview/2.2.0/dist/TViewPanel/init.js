import { readConfObject } from '@jbrowse/core/configuration';
import { parseLocString } from '@jbrowse/core/util';
import { findTrackConf } from '../LaunchTView/fetchTviewPlan';
// Derived from the interface so it cannot drift: the Record requires exactly one
// entry per key, so adding a field without listing it here is a compile error
// rather than a key that silently reads as a view prop.
const initKeyMap = {
    assembly: true,
    loc: true,
    tracks: true,
};
export const initKeys = new Set(Object.keys(initKeyMap));
/** the region `init.loc` names, or undefined until the assembly can parse it */
export function initRegion(session, init) {
    const { assemblyManager } = session;
    if (!assemblyManager.get(init.assembly)?.initialized) {
        return undefined;
    }
    const parsed = parseLocString(init.loc, refName => assemblyManager.isValidRefName(refName, init.assembly));
    return {
        assemblyName: init.assembly,
        refName: parsed.refName,
        start: parsed.start ?? 0,
        end: parsed.end ?? 0,
    };
}
function resolveTrack(session, entry) {
    const { trackId, sample } = typeof entry === 'string' ? { trackId: entry, sample: undefined } : entry;
    const conf = findTrackConf(session, trackId);
    return conf
        ? {
            trackId,
            adapterConfig: readConfObject(conf, 'adapter'),
            sample: sample || readConfObject(conf, 'name') || trackId,
        }
        : undefined;
}
/**
 * The sources `init.tracks` names, or undefined until every one of them
 * resolves. All or nothing: a partial set comes back with samples missing and
 * nothing on screen says any were.
 *
 * Whether the names are *used* is decided here and only here — one file's rows
 * need no prefix, and would gain a tree of one clade drawn beside a list.
 */
export function initSources(session, init) {
    const resolved = init.tracks.map(entry => resolveTrack(session, entry));
    const found = resolved.filter(t => t !== undefined);
    if (found.length !== init.tracks.length) {
        return undefined;
    }
    const labelled = found.length > 1;
    return found.map(track => ({
        trackId: track.trackId,
        adapterConfig: track.adapterConfig,
        sample: labelled ? track.sample : undefined,
    }));
}
//# sourceMappingURL=init.js.map