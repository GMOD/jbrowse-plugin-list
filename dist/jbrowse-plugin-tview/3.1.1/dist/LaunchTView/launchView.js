import { launchTView } from './launch';
function isTrackInit(entry) {
    return (typeof entry === 'string' ||
        (typeof entry === 'object' &&
            entry !== null &&
            'trackId' in entry &&
            typeof entry.trackId === 'string' &&
            (!('sample' in entry) || typeof entry.sample === 'string')));
}
export default function LaunchTViewF(pluginManager) {
    /** #extensionPoint LaunchView-TView | async | Programmatically launch a tview */
    pluginManager.addToExtensionPoint('LaunchView-TView', (args) => {
        const { session, assembly, loc, tracks, ...viewProps } = args;
        if (typeof assembly === 'string' &&
            typeof loc === 'string' &&
            Array.isArray(tracks) &&
            tracks.every(isTrackInit)) {
            launchTView(session, { assembly, loc, tracks }, viewProps);
        }
        else {
            throw new Error('A TView spec needs an assembly name, a loc string and a tracks array of trackIds');
        }
        return args;
    });
}
//# sourceMappingURL=launchView.js.map