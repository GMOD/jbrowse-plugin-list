import { coerceAlignmentAlgorithm } from 'p2s_mapper';
import { resolveDatasetStructures } from './datasetLaunch';
import { resolveLaunchVariant } from './launchVariant';
import { normalizeLaunch } from './normalizeLaunch';
import { resolveTranscriptLinkage, withConnectedGenomeView, } from './transcriptLinkage';
import { describeMissingStructure } from '../LaunchProteinView/resolveGeneLaunch';
import { maybeLaunchSideBySide } from '../LaunchProteinView/utils/sideBySide';
import { addProteinView } from '../ProteinView/addProteinView';
import { checkedColor, colorOfScheme } from '../ProteinView/proteinColor';
import { proteinViewSnapshot } from '../ProteinView/proteinViewSpec';
import { viewAssemblyName } from '../ProteinView/util';
/**
 * The settings as the view takes them: the algorithm coerced to the model's
 * enumeration, and the color object checked or lifted from an older
 * `colorScheme` name. Throws on a color object it refuses.
 */
export function launchViewSettings({ alignmentAlgorithm, color, colorScheme, ...settings }) {
    return {
        ...settings,
        alignmentAlgorithm: alignmentAlgorithm === undefined
            ? undefined
            : coerceAlignmentAlgorithm(alignmentAlgorithm),
        color: color !== undefined
            ? checkedColor(color)
            : colorScheme === undefined
                ? undefined
                : colorOfScheme(colorScheme),
    };
}
/**
 * The structures a launch opens, given the AlphaFold model its `gene` lookup
 * picked for the transcript, an isoform's for an isoform transcript. That
 * model fills only the structure the launch leaves to the gene; every entry of
 * `structures` names its own source, so `{ uniprotId: 'P04637' }` there opens
 * the canonical model beside any transcript.
 */
export function withGeneModel({ requested, geneModel }, named) {
    return named && geneModel
        ? requested.map(s => ({ ...s, url: named.url }))
        : requested;
}
/**
 * A LaunchView point is a transformer, so the launch returns its extendee. A
 * failure throws: the host launches a spec through
 * `evaluateAsyncExtensionPointStrict`, reports the error on screen, and tells
 * `jb.addView` the launch failed rather than that it opened a genome view.
 */
export async function launchProteinView(args) {
    const { session, ...launch } = args;
    const normalized = normalizeLaunch(await resolveDatasetStructures(session, launch));
    for (const warning of normalized.warnings) {
        console.warn(warning);
        session.notify(`Protein view launch: ${warning}`, 'warning');
    }
    if ('error' in normalized) {
        throw new Error(normalized.error);
    }
    const { geneModel, linkage } = normalized;
    const { uniprotId, transcriptId, userProvidedTranscriptSequence, feature, connectedViewId, connectedView: givenConnectedView, gene, sideBySide, variant, } = linkage;
    const settings = launchViewSettings(normalized.settings);
    // A gene name alone: the host's text search finds the gene, and the
    // launch dialog's defaults pick its isoform and AlphaFold model. A
    // structure, transcript or locus the spec names wins over those. The
    // short form instead derives the feature and sequence from the
    // connected track, and the same mapping applies to every structure.
    const { named, resolved, connectedView } = await resolveTranscriptLinkage(session, {
        gene,
        transcriptId,
        uniprotId,
        userProvidedTranscriptSequence,
        connectedView: givenConnectedView,
        connectedViewId,
    }, { findStructure: geneModel === 'required' });
    if (gene && named && geneModel === 'required' && !named.url) {
        throw new Error(`${describeMissingStructure(gene, named)}; name a ${named.uniprotId ? 'pdbId or url' : 'uniprotId or pdbId'}`);
    }
    const launchFeature = resolved?.feature ?? feature;
    const withTranscripts = withGeneModel(normalized, named).map(s => ({
        ...s,
        userProvidedTranscriptSequence: s.userProvidedTranscriptSequence ??
            resolved?.userProvidedTranscriptSequence ??
            userProvidedTranscriptSequence,
        feature: s.feature ?? launchFeature,
    }));
    const placedVariant = variant
        ? await resolveLaunchVariant({
            session,
            variant,
            structures: withTranscripts,
            launchFeature,
            assemblyName: connectedViewId
                ? viewAssemblyName(session, connectedViewId)
                : connectedView?.assembly,
        })
        : undefined;
    const requested = placedVariant?.structures ?? withTranscripts;
    const { proteinView, ownsConnectedView } = await withConnectedGenomeView(session, { connectedViewId, connectedView }, async (resolvedConnectedViewId, ownsConnectedView) => ({
        ownsConnectedView,
        proteinView: await addProteinView(session, proteinViewSnapshot({
            ...settings,
            displayName: settings.displayName ?? named?.displayName,
            structures: requested.map(s => ({
                ...s,
                connectedViewId: s.connectedViewId ?? resolvedConnectedViewId,
            })),
        })),
    }));
    if (placedVariant) {
        session.addHighlight(placedVariant.highlight);
    }
    if (ownsConnectedView) {
        maybeLaunchSideBySide(session, proteinView.id, sideBySide);
    }
    return args;
}
