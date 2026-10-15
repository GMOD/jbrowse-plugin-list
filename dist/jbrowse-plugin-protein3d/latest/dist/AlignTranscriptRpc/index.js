import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes';
// The alignment DP runs ~50 ns a cell, so a 4,000-residue transcript against
// its structure is almost a second and a complex of long chains several: on
// the main thread, frozen UI. These run it in the host's RPC worker instead,
// or in place on a host whose driver is MainThreadRpcDriver. The aligner loads
// on the first call, so registering the methods costs the plugin's boot nothing.
export class ProteinChooseMappedEntity extends RpcMethodType {
    name = 'ProteinChooseMappedEntity';
    async execute({ transcript, entities, algorithm }) {
        const { chooseMappedEntity } = await import('p2s_mapper');
        return chooseMappedEntity(transcript, entities, algorithm);
    }
}
export class ProteinAlignTranscriptToEntity extends RpcMethodType {
    name = 'ProteinAlignTranscriptToEntity';
    async execute({ transcript, entitySeq, algorithm }) {
        const { alignTranscriptToEntity } = await import('p2s_mapper');
        return alignTranscriptToEntity(transcript, entitySeq, algorithm);
    }
}
export class ProteinRankIsoforms extends RpcMethodType {
    name = 'ProteinRankIsoforms';
    async execute({ isoforms, structureSequences }) {
        const { rankIsoforms } = await import('./isoformRanking');
        return rankIsoforms(isoforms, structureSequences);
    }
}
export default function AlignTranscriptRpcF(pluginManager) {
    pluginManager.addRpcMethod(pm => new ProteinChooseMappedEntity(pm));
    pluginManager.addRpcMethod(pm => new ProteinAlignTranscriptToEntity(pm));
    pluginManager.addRpcMethod(pm => new ProteinRankIsoforms(pm));
}
