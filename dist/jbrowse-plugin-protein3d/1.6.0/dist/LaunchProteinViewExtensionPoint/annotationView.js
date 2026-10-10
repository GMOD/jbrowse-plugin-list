import { SimpleFeature } from '@jbrowse/core/util';
import { fetchAlphaFoldModels } from 'p2s_mapper';
import { normalizeAnnotationLaunch } from './normalizeAnnotationLaunch';
import { connectGenomeView, resolveTranscriptLinkage, } from './transcriptLinkage';
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
/**
 * The 1D protein-annotation view of a UniProt entry, from a session spec:
 * the same view the launch dialog's 1D option opens, linked to the transcript
 * a `gene` or `transcriptId` names the way a ProteinView spec links its
 * structures. The view itself is a LinearGenomeView on a temporary assembly,
 * so the extension point is named for the spec type rather than the view type.
 */
export default function LaunchProteinAnnotationViewF(pluginManager) {
    pluginManager.addToExtensionPoint('LaunchView-ProteinAnnotationView', async (args) => {
        const { session, ...given } = args;
        const fail = (e) => {
            console.error(e);
            session.notify(`Could not launch protein annotation view: ${e}`, 'error');
            return args;
        };
        const normalized = normalizeAnnotationLaunch(given);
        for (const warning of normalized.warnings) {
            console.warn(warning);
            session.notify(`Protein annotation view launch: ${warning}`, 'warning');
        }
        if ('error' in normalized) {
            return fail(normalized.error);
        }
        if (!canAddTemporaryAssembly(session)) {
            return fail('this session cannot add the temporary assembly the view opens on');
        }
        const { launch } = normalized;
        try {
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
            // fetched before anything is added, so a failure leaves no view
            const [featureTypes, confidenceUrl] = await Promise.all([
                fetchUniProtFeatureTypes(uniprotId),
                entryConfidenceUrl(uniprotId),
            ]);
            const transcript = resolved
                ? new SimpleFeature(resolved.feature)
                : undefined;
            const connectedViewId = transcript
                ? connectGenomeView(session, launch.connectedViewId, connectedView)
                : undefined;
            await openProteinAnnotationView({
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
            });
        }
        catch (e) {
            return fail(e);
        }
        return args;
    });
}
