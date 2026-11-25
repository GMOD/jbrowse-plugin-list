import { parseLocString } from '@jbrowse/core/util';
import { getTrackName } from '@jbrowse/core/util/tracks';
import { MAX_BP } from '../LaunchTView/limits';
function errorText(e) {
    return e instanceof Error ? e.message : String(e);
}
/**
 * The region `loc` names on `assembly`, under the assembly's own name for the
 * sequence and clamped to it, or why there is none: a locstring that does not
 * parse, a region off the end of the contig, or one wider than {@link MAX_BP}.
 * A bare refName means the whole contig, and is held to the same limit.
 */
export function checkRegion(assembly, loc) {
    try {
        const parsed = parseLocString(loc, refName => assembly.isValidRefName(refName));
        const refName = assembly.getCanonicalRefName2(parsed.refName);
        const contig = assembly.getRegionForRefName(refName);
        return contig
            ? clampToContig({
                assemblyName: assembly.name,
                refName,
                start: Math.max(contig.start, parsed.start ?? contig.start),
                end: Math.min(contig.end, parsed.end ?? contig.end),
                loc,
                contigLength: contig.end,
            })
            : { error: `${assembly.name} has no sequence named ${refName}` };
    }
    catch (e) {
        return { error: errorText(e) };
    }
}
function clampToContig({ loc, contigLength, ...region }) {
    const width = region.end - region.start;
    const n = (x) => x.toLocaleString('en-US');
    return width <= 0
        ? {
            error: `${loc} lies outside ${region.refName}, which is ${n(contigLength)}bp`,
        }
        : width > MAX_BP
            ? {
                error: `Region is ${n(width)}bp, wider than the ${n(MAX_BP)}bp limit`,
            }
            : { region };
}
/** {@link checkRegion} for `init`, or undefined until its assembly has loaded */
export function initRegion(session, init) {
    const assembly = session.assemblyManager.get(init.assembly);
    return assembly?.initialized ? checkRegion(assembly, init.loc) : undefined;
}
export function entryTrackId(entry) {
    return typeof entry === 'string' ? entry : entry.trackId;
}
function resolveTrack(session, entry) {
    const trackId = entryTrackId(entry);
    const sample = typeof entry === 'string' ? undefined : entry.sample;
    const conf = session.getTrackById(trackId);
    return conf
        ? {
            trackId,
            adapterConfig: conf.adapter,
            sample: sample || getTrackName(conf, session) || trackId,
        }
        : undefined;
}
/** what rows from `entry` are grouped under, or its trackId if no track has it */
export function trackLabel(session, entry) {
    return resolveTrack(session, entry)?.sample ?? entryTrackId(entry);
}
/**
 * The sources `init.tracks` names, or undefined until every one of them
 * resolves. All or nothing: a partial set comes back with samples missing and
 * nothing on screen says any were.
 */
export function initSources(session, init) {
    const resolved = init.tracks.map(entry => resolveTrack(session, entry));
    const found = resolved.filter(t => t !== undefined);
    return found.length === init.tracks.length ? found : undefined;
}
/** the trackIds `init.tracks` names that this session has no track for */
export function missingTrackIds(session, init) {
    return init.tracks
        .map(entryTrackId)
        .filter(trackId => !session.getTrackById(trackId));
}
//# sourceMappingURL=init.js.map