import { alignmentQuality, getUniprotIdFromAlphaFoldTarget, isLowSimilarity, } from 'p2s_mapper';
import { errorMessage } from './util';
function text(value) {
    return typeof value === 'string' ? value : undefined;
}
function mappingReport(s) {
    const { alignment, pairwiseAlignment, mappedEntity } = s;
    if (!alignment || !mappedEntity) {
        return undefined;
    }
    const quality = alignmentQuality(alignment);
    const stored = pairwiseAlignment
        ? alignmentQuality(pairwiseAlignment)
        : quality;
    return {
        entityId: mappedEntity.entityId,
        chains: mappedEntity.chains,
        ...quality,
        lowSimilarity: isLowSimilarity(quality),
        exactMatch: s.exactMatch,
        imported: s.alignmentImported,
        fusionPartnerResiduesUnmapped: stored.aligned - quality.aligned,
    };
}
function sourceOf({ pdbId, url, data }) {
    return pdbId
        ? 'pdb'
        : data !== undefined
            ? 'data'
            : url === undefined || getUniprotIdFromAlphaFoldTarget(url)
                ? 'alphafold'
                : 'url';
}
/**
 * What a structure resolved to, as plain data a script can read instead of
 * the header: its source, the chain the transcript maps to and how well, and
 * what went wrong. `mapping` is absent until the alignment settles, and for a
 * structure with no transcript.
 */
export function structureReport(s) {
    return {
        label: s.label,
        source: sourceOf(s),
        url: s.url,
        pdbId: s.pdbId,
        uniprotId: s.uniProtEntry.uniprotId,
        transcript: text(s.feature?.name) ?? text(s.feature?.id),
        hidden: s.hidden,
        loading: s.loading,
        error: s.error === undefined ? undefined : errorMessage(s.error),
        status: s.statusMessage,
        selection: s.clickedStructureRanges.map(({ start, end }) => ({
            start,
            end,
        })),
        mapping: mappingReport(s),
    };
}
