import { readConfObject } from '@jbrowse/core/configuration';
import { MAX_CELLS } from './limits';
export function findTrackConf(session, trackId) {
    return session.getTrackById
        ? session.getTrackById(trackId)
        : session.getTracksById
            ? session.getTracksById()[trackId]
            : session.tracksById
                ? session.tracksById[trackId]
                : session.tracks.find(t => readConfObject(t, 'trackId') === trackId);
}
/**
 * The assembly's own sequence adapter, which is what makes the reference a row
 * and, through it, makes an array an interval rather than an insertion. An
 * assembly that cannot supply one still works: the alignment is then reads only
 * and no array is reported, which is the pre-reference behaviour.
 */
export function sequenceAdapterConfig(session, assemblyName) {
    const assembly = session.assemblyManager.get(assemblyName);
    const conf = assembly?.configuration;
    return conf
        ? readConfObject(conf, ['sequence', 'adapter'])
        : undefined;
}
/**
 * One RPC per launch, however many files it draws from. The session id is
 * shared across the sources so the worker keeps one adapter cache for the view
 * rather than one per file.
 */
export async function fetchTviewPlan({ session, sources, region, maxCells = MAX_CELLS, }) {
    const rpcSessionId = `tview-${sources.map(s => s.trackId).join(',')}`;
    return (await session.rpcManager.call(rpcSessionId, 'TviewGetPlan', {
        sessionId: rpcSessionId,
        sources: sources.map(s => ({
            adapterConfig: s.adapterConfig,
            sample: s.sample,
        })),
        sequenceAdapterConfig: sequenceAdapterConfig(session, region.assemblyName),
        region,
        maxCells,
    }));
}
//# sourceMappingURL=fetchTviewPlan.js.map