import { setupProteinAssembly } from './proteinAssemblySetup';
import { fetchUniProtFeatureTypes, proteinTrackConfs, } from './proteinTrackSetup';
import { formatViewName } from '../utils/launchViewUtils';
function isTrackLaunchingView(view) {
    return ('id' in view &&
        typeof view.id === 'string' &&
        'launchTrack' in view &&
        typeof view.launchTrack === 'function' &&
        'navToLocString' in view &&
        typeof view.navToLocString === 'function');
}
export async function launchProteinAnnotationView({ session, feature, selectedTranscript, uniprotId, confidenceUrl, connectedViewId, connectedAssemblyName, }) {
    // Fetched before anything is added: a failed download would otherwise
    // leave a temporary assembly behind with no view on it
    const featureTypes = await fetchUniProtFeatureTypes(uniprotId);
    // A second view of an entry, another isoform's say, shares the first's
    // assembly; adding it again makes the host warn
    if (!session.assemblyManager.get(uniprotId)) {
        setupProteinAssembly(session, uniprotId);
    }
    // The linkage drives the 1D<->genome hover highlight. It is a property of
    // the view (see Protein1DLinkage) so it is saved with the session.
    const proteinLinkage = connectedViewId && selectedTranscript
        ? {
            connectedViewId,
            assemblyName: connectedAssemblyName,
            feature: selectedTranscript.toJSON(),
            uniprotId,
        }
        : undefined;
    const view = session.addView('LinearGenomeView', {
        type: 'LinearGenomeView',
        displayName: formatViewName('Protein annotations', feature, selectedTranscript, uniprotId),
        proteinLinkage,
    });
    if (!isTrackLaunchingView(view)) {
        throw new Error('The host added a view that cannot open tracks');
    }
    // Each config rides on its track in this view, not in the session's track
    // list: the host rejects a session track naming a temporary assembly, and
    // the track selector lists session tracks only, so every track opens here
    // or is unreachable
    for (const conf of proteinTrackConfs({
        uniprotId,
        featureTypes,
        confidenceUrl,
        idPrefix: `${view.id}-${uniprotId}`,
    })) {
        try {
            // the host reports a config it rejects itself and resolves undefined
            await view.launchTrack(conf.trackId, {}, {}, conf);
        }
        catch (e) {
            session.notifyError(`Could not open the ${conf.name} track: ${e}`, e);
        }
    }
    await view.navToLocString(uniprotId, uniprotId);
}
