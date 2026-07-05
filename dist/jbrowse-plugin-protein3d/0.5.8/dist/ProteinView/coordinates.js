import { structurePositionToAlignmentMap, structureSeqVsTranscriptSeqMap, transcriptPositionToAlignmentMap, } from '../mappings';
import { invertMap } from './util';
export const structurePos = (n) => n;
export const transcriptPos = (n) => n;
export const alignmentCol = (n) => n;
/**
 * Builds every coordinate conversion once from a pairwise alignment, replacing
 * the scatter of per-getter map builds + repeated invertMap calls. The branded
 * methods are the preferred API; `maps` stays unbranded for whole-map consumers.
 */
export function makeCoordinateMapper(pairwiseAlignment) {
    const { structureSeqToTranscriptSeqPosition, transcriptSeqToStructureSeqPosition, } = structureSeqVsTranscriptSeqMap(pairwiseAlignment);
    const s2aln = structurePositionToAlignmentMap(pairwiseAlignment);
    const t2aln = transcriptPositionToAlignmentMap(pairwiseAlignment);
    const aln2s = invertMap(s2aln);
    const aln2t = invertMap(t2aln);
    // The `as` casts below are the single brand-crossing point: indexing a
    // Record<number,number> yields a plain number that we re-brand to its output
    // space. Isolated here so the rest of the codebase stays brand-clean.
    return {
        structureToTranscript: p => structureSeqToTranscriptSeqPosition[p],
        transcriptToStructure: p => transcriptSeqToStructureSeqPosition[p],
        structureToAlignment: p => s2aln[p],
        alignmentToStructure: c => aln2s[c],
        transcriptToAlignment: p => t2aln[p],
        alignmentToTranscript: c => aln2t[c],
        maps: {
            structureSeqToTranscriptSeqPosition,
            transcriptSeqToStructureSeqPosition,
            structurePositionToAlignmentMap: s2aln,
            transcriptPositionToAlignmentMap: t2aln,
            alignmentToStructurePosition: aln2s,
            alignmentToTranscriptPosition: aln2t,
        },
    };
}
