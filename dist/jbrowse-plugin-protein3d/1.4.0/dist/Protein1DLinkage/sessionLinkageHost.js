import { SimpleFeature } from '@jbrowse/core/util';
import { DEFAULT_ALIGNMENT_ALGORITHM, alignTranscriptToEntity, } from 'p2s_mapper';
import { linkedGenomeAssemblyName } from './linkage';
import { fetchProteinSeq, fetchRegionSequence, } from '../LaunchProteinView/utils/translateTranscripts';
import { alignOffThread } from '../ProteinView/alignOffThread';
/** The linkage's two sequences as a session holds them: the transcript on the
 * genome assembly, the UniProt entry on the 1D view's own temporary one. */
export function sessionLinkageHost(session, linkage) {
    const { uniprotId } = linkage;
    return {
        transcriptProtein: () => fetchProteinSeq({
            feature: new SimpleFeature(linkage.feature),
            session,
            assemblyName: linkedGenomeAssemblyName(session, linkage),
        }),
        uniprotSequence: async () => {
            const assembly = await session.assemblyManager.waitForAssembly(uniprotId);
            const region = assembly?.regions?.[0];
            return region
                ? (await fetchRegionSequence({
                    session,
                    assemblyName: uniprotId,
                    refName: region.refName,
                    start: region.start,
                    end: region.end,
                })).seq
                : undefined;
        },
        align: (transcript, entitySeq) => alignOffThread({
            rpcManager: session.rpcManager,
            name: 'ProteinAlignTranscriptToEntity',
            args: { transcript, entitySeq, algorithm: DEFAULT_ALIGNMENT_ALGORITHM },
            inPlace: () => alignTranscriptToEntity(transcript, entitySeq, DEFAULT_ALIGNMENT_ALGORITHM),
        }),
    };
}
