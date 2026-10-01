import { isSessionModel } from '@jbrowse/core/util';
export function isSessionWithAddTracks(t) {
    return (isSessionModel(t) &&
        'addTrackConf' in t &&
        !('disableAddTracks' in t && t.disableAddTracks));
}
