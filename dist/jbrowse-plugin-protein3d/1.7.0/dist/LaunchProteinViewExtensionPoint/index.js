import { coerceAlignmentAlgorithm } from 'p2s_mapper';
import { normalizeLaunch } from './normalizeLaunch';
import { connectGenomeView, resolveTranscriptLinkage, } from './transcriptLinkage';
import { describeMissingStructure } from '../LaunchProteinView/resolveGeneLaunch';
import { maybeLaunchSideBySide } from '../LaunchProteinView/utils/sideBySide';
import { coerceColorScheme } from '../ProteinView/applyColorTheme';
import { proteinViewSnapshot } from '../ProteinView/proteinViewSpec';
export function launchViewSnapshot({ alignmentAlgorithm, colorScheme, ...settings }, structures) {
    return proteinViewSnapshot({
        ...settings,
        alignmentAlgorithm: alignmentAlgorithm === undefined
            ? undefined
            : coerceAlignmentAlgorithm(alignmentAlgorithm),
        colorScheme: colorScheme === undefined ? undefined : coerceColorScheme(colorScheme),
        structures,
    });
}
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
        const { session, structures: _structures, url: _url, data: _data, pdbId: _pdbId, initialSelection: _initialSelection, initialResidues: _initialResidues, initialTranscriptResidues: _initialTranscriptResidues, mappedEntityId: _mappedEntityId, pairwiseAlignment: _pairwiseAlignment, alignmentImported: _alignmentImported, hidden: _hidden, uniprotId, transcriptId, userProvidedTranscriptSequence, feature, connectedViewId, connectedView: givenConnectedView, gene, sideBySide, ...settings } = args;
        const fail = (e) => {
            console.error(e);
            session.notify(`Could not launch protein view: ${e}`, 'error');
            return args;
        };
        const { session: _session, ...launch } = args;
        const normalized = normalizeLaunch(launch);
        for (const warning of normalized.warnings) {
            console.warn(warning);
            session.notify(`Protein view launch: ${warning}`, 'warning');
        }
        if ('error' in normalized) {
            return fail(normalized.error);
        }
        const { geneModel } = normalized;
        // A gene name alone: the host's text search finds the gene, and the
        // launch dialog's defaults pick its isoform and AlphaFold model. A
        // structure, transcript or locus the spec names wins over those. The
        // short form instead derives the feature and sequence from the
        // connected track, and the same mapping applies to every structure.
        let linkage;
        try {
            linkage = await resolveTranscriptLinkage(session, {
                gene,
                transcriptId,
                uniprotId,
                userProvidedTranscriptSequence,
                connectedView: givenConnectedView,
                connectedViewId,
            }, { findStructure: geneModel === 'required' });
        }
        catch (e) {
            return fail(e);
        }
        const { named, resolved, connectedView } = linkage;
        if (gene && named && geneModel === 'required' && !named.url) {
            return fail(new Error(`${describeMissingStructure(gene, named)}; name a ${named.uniprotId ? 'pdbId or url' : 'uniprotId or pdbId'}`));
        }
        const requested = named && geneModel
            ? normalized.requested.map(s => ({ ...s, url: named.url }))
            : normalized.requested;
        // a connected view this launch created itself can be split beside the
        // protein view; a pre-existing connectedViewId is left in place
        const ownsConnectedView = !connectedViewId && !!connectedView;
        const resolvedConnectedViewId = connectGenomeView(session, connectedViewId, connectedView);
        const structures = requested.map(s => ({
            ...s,
            userProvidedTranscriptSequence: s.userProvidedTranscriptSequence ??
                resolved?.userProvidedTranscriptSequence ??
                userProvidedTranscriptSequence,
            feature: s.feature ?? resolved?.feature ?? feature,
            connectedViewId: s.connectedViewId ?? resolvedConnectedViewId,
        }));
        const proteinView = session.addView('ProteinView', launchViewSnapshot({ displayName: named?.displayName, ...settings }, structures));
        if (ownsConnectedView) {
            maybeLaunchSideBySide(session, proteinView.id, sideBySide);
        }
        return args;
    });
}
