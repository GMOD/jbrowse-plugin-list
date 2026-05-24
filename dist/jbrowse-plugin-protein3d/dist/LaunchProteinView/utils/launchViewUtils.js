import { isSessionWithAddTracks } from '@jbrowse/core/util';
import { getGeneDisplayName, getTranscriptDisplayName } from './util';
import { launchProteinAnnotationView } from '../components/launchProteinAnnotationView';
export const ALPHAFOLD_VERSION = 'v6';
export function getAlphaFoldStructureUrl(uniprotId, version = ALPHAFOLD_VERSION) {
    return `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_${version}.cif`;
}
export function getAlphaFoldConfidenceUrl(uniprotId, version = ALPHAFOLD_VERSION) {
    return `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-confidence_${version}.json`;
}
export function getAlphaFoldMsaUrl(uniprotId, version = ALPHAFOLD_VERSION) {
    return `https://alphafold.ebi.ac.uk/files/msa/AF-${uniprotId}-F1-msa_${version}.a3m`;
}
export function getPdbStructureUrl(pdbId) {
    return `https://files.rcsb.org/download/${pdbId}.cif`;
}
// Foldseek targets may contain a description after the ID separated by a
// space, e.g. "AF-P16442-F1-model_v6 Histo-blood group ABO transferase".
function extractTargetId(target) {
    return target.split(' ')[0] ?? target;
}
export function getUniprotIdFromAlphaFoldTarget(target) {
    // Handles both "AF-P16442-F1-model_v6" and full URLs like
    // "https://alphafold.ebi.ac.uk/files/AF-P16442-F1-model_v6.cif"
    const match = /AF-([A-Z0-9]+)-F\d+/.exec(extractTargetId(target));
    return match?.[1];
}
export function getStructureUrlFromTarget(target, db) {
    const targetId = extractTargetId(target);
    if (targetId.startsWith('AF-')) {
        return `https://alphafold.ebi.ac.uk/files/${targetId}.cif`;
    }
    if (db === 'pdb100') {
        const pdbId = targetId.split('_')[0];
        if (pdbId?.length === 4) {
            return getPdbStructureUrl(pdbId);
        }
    }
    return undefined;
}
export function getConfidenceUrlFromTarget(target) {
    const targetId = extractTargetId(target);
    if (targetId.startsWith('AF-')) {
        const confidenceId = targetId.replace('-model_', '-confidence_');
        return `https://alphafold.ebi.ac.uk/files/${confidenceId}.json`;
    }
    return undefined;
}
function formatViewName(prefix, feature, selectedTranscript, uniprotId) {
    return [
        ...new Set([
            prefix,
            uniprotId,
            getGeneDisplayName(feature),
            getTranscriptDisplayName(selectedTranscript),
        ]),
    ].join(' - ');
}
export function launch3DProteinView({ session, view, feature, selectedTranscript, uniprotId, url, data, userProvidedTranscriptSequence, alignmentAlgorithm, displayName, connectedMsaViewId, }) {
    return session.addView('ProteinView', {
        type: 'ProteinView',
        isFloating: true,
        alignmentAlgorithm,
        connectedMsaViewId,
        structures: [
            {
                url,
                data,
                userProvidedTranscriptSequence: userProvidedTranscriptSequence ?? '',
                feature: selectedTranscript?.toJSON(),
                connectedViewId: view.id,
            },
        ],
        displayName: displayName ??
            formatViewName('Protein view', feature, selectedTranscript, uniprotId),
    });
}
export async function launch1DProteinView({ session, view, feature, selectedTranscript, uniprotId, confidenceUrl, }) {
    if (!uniprotId || !isSessionWithAddTracks(session)) {
        return;
    }
    await launchProteinAnnotationView({
        session,
        selectedTranscript,
        feature,
        uniprotId,
        confidenceUrl,
        connectedViewId: view.id,
    });
}
export function launchMsaView({ session, view, feature, selectedTranscript, uniprotId, displayName, }) {
    if (!uniprotId) {
        return undefined;
    }
    return session.addView('MsaView', {
        type: 'MsaView',
        displayName: displayName ??
            formatViewName('MSA view', feature, selectedTranscript, uniprotId),
        connectedViewId: view.id,
        connectedFeature: selectedTranscript?.toJSON(),
        init: {
            msaUrl: getAlphaFoldMsaUrl(uniprotId),
            colorSchemeName: 'percent_identity',
        },
    });
}
export function hasMsaViewPlugin() {
    return window.JBrowsePluginMsaView !== undefined;
}
export function launch3DProteinViewWithMsa(params) {
    const { feature, selectedTranscript, uniprotId } = params;
    if (!uniprotId) {
        return undefined;
    }
    const msaView = launchMsaView(params);
    return launch3DProteinView({
        ...params,
        displayName: params.displayName ??
            formatViewName('Protein view', feature, selectedTranscript, uniprotId),
        connectedMsaViewId: msaView?.id,
    });
}
