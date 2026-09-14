import { resolveShortLaunch, } from './resolveShortLaunch';
import { maybeLaunchSideBySide } from '../LaunchProteinView/utils/sideBySide';
import { resolveStructureUrl } from '../LaunchProteinView/utils/structureUrls';
import { coerceColorScheme } from '../ProteinView/applyColorTheme';
import { proteinViewSnapshot } from '../ProteinView/proteinViewSpec';
import { coerceAlignmentAlgorithm } from '../ProteinView/types';
export default function LaunchProteinViewExtensionPointF(pluginManager) {
    pluginManager.addToExtensionPoint('LaunchView-ProteinView', 
    // A LaunchView point is a transformer — the chain hands what each callback
    // returns to the next — and JBrowse now warns when one returns undefined
    // ("...returned undefined instead of the value it was passed, so its result
    // was ignored"), on every launch. This used to return nothing on the
    // assumption that the result was ignored; it is not. The handler returns
    // its extendee at each exit now, like jbrowse-components' own
    // LaunchDotplotView does.
    async (args) => {
        const { session, url, uniprotId, pdbId, transcriptId, userProvidedTranscriptSequence, feature, connectedViewId, connectedView, alignmentAlgorithm, colorScheme, displayName, height, showControls, showHighlight, showAlignment, showProteinTracks, compactTracks, autoScrollAlignment, zoomToBaseLevel, sideBySide, initialSelection, initialResidues, initialTranscriptResidues, } = args;
        const requested = args.structures?.length
            ? args.structures
            : [
                {
                    url,
                    uniprotId,
                    pdbId,
                    initialSelection,
                    initialResidues,
                    initialTranscriptResidues,
                },
            ];
        const urls = requested.map(s => resolveStructureUrl(s));
        const primary = requested[0];
        const primaryUrl = urls[0];
        if (!primaryUrl && primary.data === undefined) {
            const message = 'No url, uniprotId or pdbId provided when launching protein view';
            console.error(message);
            session.notify(`Could not launch protein view: ${message}`, 'error');
            return args;
        }
        // Short form: a `transcriptId` plus a `connectedView` in place of an
        // explicit `feature` + sequence. resolveShortLaunch derives both from the
        // connected track, and the same mapping then applies to every structure
        // of the launch. Failures surface via notify and abort — we never leave a
        // half-wired view (see agent-docs/urlparam_plan.md).
        let resolved;
        if (!userProvidedTranscriptSequence && transcriptId && primaryUrl) {
            try {
                resolved = await resolveShortLaunch({
                    session,
                    structureUrl: primaryUrl,
                    transcriptId,
                    connectedView,
                });
            }
            catch (e) {
                console.error(e);
                session.notify(`Could not launch protein view: ${e}`, 'error');
                return args;
            }
        }
        // A session spec launches each view independently with an auto-generated
        // id, so it cannot pre-compute a connectedViewId to cross-reference. When
        // `connectedView` is supplied we create the LinearGenomeView here and wire
        // its id, letting a single spec entry produce a connected genome+protein
        // pair (e.g. hover a variant to highlight the residue).
        // a connected view this launch created itself can be split beside the
        // protein view; a pre-existing connectedViewId is left in place
        const ownsConnectedView = !connectedViewId && !!connectedView;
        const resolvedConnectedViewId = connectedViewId ??
            (connectedView
                ? session.addView('LinearGenomeView', {
                    type: 'LinearGenomeView',
                    // a spec's connectedView is unvalidated json, so a missing
                    // assembly reaches the view and is reported there, as before
                    init: connectedView,
                }).id
                : undefined);
        const structures = requested.map((s, i) => ({
            url: urls[i],
            data: s.data,
            initialSelection: s.initialSelection,
            initialResidues: s.initialResidues,
            initialTranscriptResidues: s.initialTranscriptResidues,
            mappedEntityId: s.mappedEntityId,
            userProvidedTranscriptSequence: s.userProvidedTranscriptSequence ??
                resolved?.userProvidedTranscriptSequence ??
                userProvidedTranscriptSequence,
            feature: s.feature ?? resolved?.feature ?? feature,
            connectedViewId: s.connectedViewId ?? resolvedConnectedViewId,
        }));
        const proteinView = session.addView('ProteinView', proteinViewSnapshot({
            // a URL param is untrusted text; the model properties are enumerations
            alignmentAlgorithm: alignmentAlgorithm === undefined
                ? undefined
                : coerceAlignmentAlgorithm(alignmentAlgorithm),
            colorScheme: colorScheme === undefined
                ? undefined
                : coerceColorScheme(colorScheme),
            displayName,
            height,
            showControls,
            showHighlight,
            showAlignment,
            showProteinTracks,
            compactTracks,
            autoScrollAlignment,
            zoomToBaseLevel,
            structures,
        }));
        if (ownsConnectedView) {
            maybeLaunchSideBySide(session, proteinView.id, sideBySide);
        }
        return args;
    });
}
