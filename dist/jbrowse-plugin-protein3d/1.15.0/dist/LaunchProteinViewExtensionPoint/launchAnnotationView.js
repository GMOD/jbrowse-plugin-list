import { SimpleFeature } from '@jbrowse/core/util';
import { fetchAlphaFoldModels } from 'p2s_mapper';
import { normalizeAnnotationLaunch } from './normalizeAnnotationLaunch';
import { resolveTranscriptLinkage, withConnectedGenomeView, } from './transcriptLinkage';
import { clinVarTrackConfFor } from '../LaunchProteinView/components/clinVarTrackSource';
import { openProteinAnnotationView } from '../LaunchProteinView/components/launchProteinAnnotationView';
import { canAddTemporaryAssembly } from '../LaunchProteinView/components/proteinAssemblySetup';
import { fetchUniProtFeatureTypes } from '../LaunchProteinView/components/proteinTrackSetup';
import { describeMissingStructure } from '../LaunchProteinView/resolveGeneLaunch';
import { uniProtEntry } from '../LaunchProteinView/utils/launchViewUtils';
import { viewAssemblyName } from '../ProteinView/util';
// The canonical model's pLDDT is in the entry's numbering; an isoform model's
// is not, and has no place on the entry's track
async function entryConfidenceUrl(uniprotId) {
    try {
        const models = await fetchAlphaFoldModels(uniprotId);
        return models.find(m => m.accession === uniprotId)?.confidenceUrl;
    }
    catch {
        return undefined;
    }
}
/** Fails by throwing, as `launchProteinView` does and for the same reason. */
export async function launchAnnotationView(args) {
    const { session, ...given } = args;
    const normalized = normalizeAnnotationLaunch(given);
    for (const warning of normalized.warnings) {
        console.warn(warning);
        session.notify(`Protein annotation view launch: ${warning}`, 'warning');
    }
    if ('error' in normalized) {
        throw new Error(normalized.error);
    }
    if (!canAddTemporaryAssembly(session)) {
        throw new Error('this session cannot add the temporary assembly the view opens on');
    }
    const { launch } = normalized;
    const { named, resolved, connectedView } = await resolveTranscriptLinkage(session, launch, {
        findStructure: !launch.uniprotId,
    });
    const accession = launch.uniprotId ?? named?.uniprotId;
    if (!accession) {
        throw new Error(launch.gene && named
            ? `${describeMissingStructure(launch.gene, named)}; name a uniprotId`
            : 'no UniProt entry to open');
    }
    const uniprotId = uniProtEntry(accession);
    const [featureTypes, confidenceUrl] = await Promise.all([
        fetchUniProtFeatureTypes(uniprotId),
        entryConfidenceUrl(uniprotId),
    ]);
    const transcript = resolved ? new SimpleFeature(resolved.feature) : undefined;
    await withConnectedGenomeView(session, transcript
        ? { connectedViewId: launch.connectedViewId, connectedView }
        : {}, connectedViewId => openProteinAnnotationView({
        session,
        feature: transcript,
        selectedTranscript: transcript,
        uniprotId,
        confidenceUrl,
        connectedViewId,
        connectedAssemblyName: (launch.connectedViewId
            ? viewAssemblyName(session, launch.connectedViewId)
            : undefined) ?? connectedView?.assembly,
        featureTypes,
        clinVar: (linkage, idPrefix) => clinVarTrackConfFor({ session, linkage, idPrefix }),
    }));
    return args;
}
