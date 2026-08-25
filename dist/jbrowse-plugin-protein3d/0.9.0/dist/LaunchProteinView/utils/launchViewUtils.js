import { isSessionWithAddTracks } from '@jbrowse/core/util';
import { maybeLaunchSideBySide } from './sideBySide';
import { getGeneDisplayName, getTranscriptDisplayName } from './util';
import { proteinViewSnapshot } from '../../ProteinView/proteinViewSpec';
import { launchProteinAnnotationView } from '../components/launchProteinAnnotationView';
export function formatViewName(prefix, feature, selectedTranscript, uniprotId) {
    return [
        ...new Set([
            prefix,
            uniprotId,
            getGeneDisplayName(feature),
            getTranscriptDisplayName(selectedTranscript),
        ]),
    ]
        .filter(s => !!s)
        .join(' - ');
}
export function launch3DProteinView({ session, view, feature, selectedTranscript, uniprotId, url, data, userProvidedTranscriptSequence, alignmentAlgorithm, displayName, connectedMsaViewId, sideBySide, }) {
    const snap = proteinViewSnapshot({
        alignmentAlgorithm,
        connectedMsaViewId,
        displayName: displayName ??
            formatViewName('Protein view', feature, selectedTranscript, uniprotId),
        structures: [
            {
                url,
                data,
                userProvidedTranscriptSequence,
                feature: selectedTranscript?.toJSON(),
                connectedViewId: view.id,
            },
        ],
    });
    const proteinView = session.addView('ProteinView', snap);
    maybeLaunchSideBySide(session, proteinView.id, sideBySide);
    return proteinView;
}
// The 1D annotation view adds temporary tracks/assemblies, so it requires a
// SessionWithAddTracks and a known uniprotId. Demanding both in the signature
// forces callers to narrow up front — there's no silent no-op when a wide
// session or missing id slips through.
async function launch1DProteinView({ session, view, feature, selectedTranscript, uniprotId, confidenceUrl, }) {
    await launchProteinAnnotationView({
        session,
        selectedTranscript,
        feature,
        uniprotId,
        confidenceUrl,
        connectedViewId: view.id,
    });
}
// What the launches below are CALLED, shared for the same reason their
// availability is: the AlphaFold and Foldseek menus offer the same actions, and
// had drifted to different names ("Launch 3D protein structure view" vs "Launch
// 3D protein view"). Two names for one action reads as two actions.
export const PROTEIN_LAUNCH_LABELS = {
    '3d': 'Launch 3D protein structure view',
    '1d': 'Launch 1D protein annotation view',
};
// The 1D-annotation launch has the same availability rule on both the AlphaFold
// and Foldseek launch menus: a session it can add tracks to, and a uniprotId.
// Returning it as a ready-to-run thunk (or undefined when unavailable) is the
// single source of truth — an unavailable action is unrepresentable rather than
// a menu item that silently no-ops.
export function getConditionalProteinLaunches({ session, view, feature, selectedTranscript, uniprotId, confidenceUrl, }) {
    const addTracksSession = isSessionWithAddTracks(session) ? session : undefined;
    return {
        launch1D: addTracksSession && uniprotId
            ? () => launch1DProteinView({
                session: addTracksSession,
                view,
                feature,
                selectedTranscript,
                uniprotId,
                confidenceUrl,
            })
            : undefined,
    };
}
