import { getConf, readConfObject } from '@jbrowse/core/configuration';
import { getRpcSessionId } from '@jbrowse/core/util/tracks';
import { planTviewMsa } from './tview';
export function sourceFromTrack(track) {
    return {
        adapterConfig: getConf(track, 'adapter'),
        rpcSessionId: getRpcSessionId(track),
    };
}
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
 * A rebuild runs from the track's config rather than a track model, so it works
 * whether or not the track is still open anywhere in the session.
 */
export function sourceFromConfig(conf) {
    return {
        adapterConfig: readConfObject(conf, 'adapter'),
        rpcSessionId: `tview-${readConfObject(conf, 'trackId')}`,
    };
}
export async function fetchTviewPlan({ session, source, region, }) {
    const { adapterConfig, rpcSessionId } = source;
    const feats = (await session.rpcManager.call(rpcSessionId, 'CoreGetFeatures', {
        adapterConfig,
        sessionId: rpcSessionId,
        regions: [region],
    }));
    const features = feats.filter(f => !!f.get('seq'));
    // only planned, not rendered: a caller may cancel, or find it too large
    return {
        plan: planTviewMsa({ features, ...region }),
        rowCount: features.length,
    };
}
//# sourceMappingURL=fetchTviewPlan.js.map