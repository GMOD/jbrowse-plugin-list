import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes';
import { alignTranscriptToEntity, chooseMappedEntity, classifyIsoforms, pickStructureSequence, } from 'p2s_mapper';
/** The launch dialog's isoform order: one alignment per chain to pick the
 * chain, then one per isoform that does not match it exactly. */
export function rankIsoforms(isoforms, structureSequences) {
    const structureSequence = pickStructureSequence(structureSequences, isoforms);
    return {
        structureSequence,
        ranking: classifyIsoforms({ isoforms, structureSequence }),
    };
}
/**
 * The isoform to open from a ranking. An exact match to the structure wins;
 * the annotation's flagged transcript (MANE Select) breaks a tie between exact
 * matches, and leads when there is no structure to rank against, where length
 * alone would decide.
 */
export function rankedTranscriptId({ matches, nonMatches }, flaggedId) {
    const flagged = (list) => list.find(i => i.id === flaggedId);
    const unranked = nonMatches.every(i => i.score === undefined);
    return (flagged(matches) ??
        matches[0] ??
        (unranked ? flagged(nonMatches) : undefined) ??
        nonMatches[0])?.id;
}
// The alignment DP runs ~50 ns a cell, so a 4,000-residue transcript against
// its structure is almost a second and a complex of long chains several: on
// the main thread, frozen UI. These run it in the host's RPC worker instead,
// or in place on a host whose driver is MainThreadRpcDriver.
export class ProteinChooseMappedEntity extends RpcMethodType {
    name = 'ProteinChooseMappedEntity';
    async execute({ transcript, entities, algorithm }) {
        return chooseMappedEntity(transcript, entities, algorithm);
    }
}
export class ProteinAlignTranscriptToEntity extends RpcMethodType {
    name = 'ProteinAlignTranscriptToEntity';
    async execute({ transcript, entitySeq, algorithm }) {
        return alignTranscriptToEntity(transcript, entitySeq, algorithm);
    }
}
export class ProteinRankIsoforms extends RpcMethodType {
    name = 'ProteinRankIsoforms';
    async execute({ isoforms, structureSequences }) {
        return rankIsoforms(isoforms, structureSequences);
    }
}
export default function AlignTranscriptRpcF(pluginManager) {
    pluginManager.addRpcMethod(pm => new ProteinChooseMappedEntity(pm));
    pluginManager.addRpcMethod(pm => new ProteinAlignTranscriptToEntity(pm));
    pluginManager.addRpcMethod(pm => new ProteinRankIsoforms(pm));
}
