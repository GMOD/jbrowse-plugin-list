import { isIdentical } from './alignOffThread';
import { entityAlignedTo } from './entityAlignedTo';
/**
 * Keeps an alignment computed here. Maps an imported one onto the chain it
 * spells, realigns one that spells none against the stored protein chain, and
 * otherwise discards it. Reads only the fields each branch needs, so an
 * autorun calling it tracks no more.
 */
export function decideAlignment(state) {
    const { userProvidedTranscriptSequence: transcript, entities, pairwiseAlignment, } = state;
    if (!transcript || !entities?.length) {
        return { kind: 'nothingToAlign' };
    }
    if (pairwiseAlignment) {
        if (!state.alignmentImported) {
            return { kind: 'keep' };
        }
        const { mappedEntityId } = state;
        const fit = entityAlignedTo(pairwiseAlignment, transcript, entities, mappedEntityId);
        if ('entityId' in fit) {
            return { kind: 'adopt', entityId: fit.entityId };
        }
        const entity = entities.find(e => e.entityId === mappedEntityId && !e.nucleicAcid);
        return entity
            ? {
                kind: 'realign',
                problem: fit.problem,
                transcript,
                entity,
                identical: isIdentical(transcript, entity.seq),
            }
            : { kind: 'discard', problem: fit.problem };
    }
    return {
        kind: 'choose',
        transcript,
        entities,
        identical: entities.some(e => !e.nucleicAcid && isIdentical(transcript, e.seq)),
    };
}
