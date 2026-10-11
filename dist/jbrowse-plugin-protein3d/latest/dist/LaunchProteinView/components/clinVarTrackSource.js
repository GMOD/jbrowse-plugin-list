import { SimpleFeature } from '@jbrowse/core/util';
import { makeCoordinateMapper, transcriptPos } from 'p2s_mapper';
import { clinVarTrackConf, clinVarTrackFeatures } from './clinVarTrack';
import { linkedGenomeAssemblyName, resolveLinkageAlignment, } from '../../Protein1DLinkage/linkage';
import { sessionLinkageHost } from '../../Protein1DLinkage/sessionLinkageHost';
import { clinVarBuild, isUnnumberedMitochondrion, } from '../../ProteinView/clinVar';
import { placeClinVarOnTranscript } from '../../ProteinView/clinVarSource';
// TP53's slice is under 1 MB; a stalled host should not hold the view open
// forever on one track
const CLINVAR_TIMEOUT_MS = 60_000;
/**
 * The ClinVar track of a 1D view: every missense substitution NCBI's VCF
 * classifies on the linked transcript, each on the entry residue its
 * transcript residue aligns to. Undefined, with no track, when the genome
 * view's assembly is not a build ClinVar numbers, or the transcript and the
 * entry do not align; the view's own linkage reports the latter. A failed
 * read throws, for the opener to report as the track's.
 */
export async function clinVarTrackConfFor({ session, linkage, idPrefix, }) {
    const { uniprotId, feature } = linkage;
    const assemblyName = linkedGenomeAssemblyName(session, linkage);
    const assembly = assemblyName
        ? session.assemblyManager.get(assemblyName)
        : undefined;
    const build = clinVarBuild([
        ...(assemblyName ? [assemblyName] : []),
        ...(assembly ? [assembly.name, ...assembly.aliases] : []),
    ]);
    if (!assemblyName ||
        !build ||
        isUnnumberedMitochondrion(feature.refName, build)) {
        return undefined;
    }
    const linked = await resolveLinkageAlignment(sessionLinkageHost(session, linkage));
    if (!('alignment' in linked)) {
        return undefined;
    }
    const { placed } = await placeClinVarOnTranscript({
        build,
        feature: new SimpleFeature(feature),
        assemblyName,
        session,
        signal: AbortSignal.timeout(CLINVAR_TIMEOUT_MS),
    });
    const mapper = makeCoordinateMapper(linked.alignment);
    return clinVarTrackConf({
        uniprotId,
        idPrefix,
        features: clinVarTrackFeatures({
            placed,
            uniprotId,
            toEntryPosition: residue => mapper.transcriptToStructure(transcriptPos(residue)),
        }),
    });
}
