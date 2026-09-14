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
/**
 * The 0-based half-open structure-position range covering an inclusive range
 * of 1-based transcript residues, the numbering a UniProt feature or a domain
 * map uses. Residues the structure lacks are skipped, so a range that runs
 * past a fragment's end clamps to the last modeled residue; undefined when none
 * of the range aligns to the structure.
 */
export function transcriptRangeToStructureRange(mapper, range) {
    let first;
    let last;
    for (let residue = range.start; residue <= range.end; residue++) {
        const pos = mapper.transcriptToStructure(transcriptPos(residue - 1));
        if (pos !== undefined) {
            first = first === undefined ? pos : Math.min(first, pos);
            last = last === undefined ? pos : Math.max(last, pos);
        }
    }
    return first === undefined || last === undefined
        ? undefined
        : { start: first, end: last + 1 };
}
