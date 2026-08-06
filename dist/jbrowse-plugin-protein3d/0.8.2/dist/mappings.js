import { genomeToTranscriptSeqMapping as g2p, getCodonRanges } from 'g2p_mapper';
export const transcriptAlignedSeq = (pa) => pa.alns[0].seq;
export const structureAlignedSeq = (pa) => pa.alns[1].seq;
/** Number of columns, gaps included. Both rows have this length by definition;
 * `pairwiseAlignmentProblem` is what guarantees it. */
export const alignmentLength = (pa) => transcriptAlignedSeq(pa).length;
/**
 * Why a pairwise alignment can't be used, or undefined if it's usable. The two
 * rows must be the same non-zero length — every coordinate map walks them in
 * lockstep, so a ragged pair would map positions to nonsense. Callers that
 * accept alignments from outside (the manual-import dialog) check this and
 * report it; the internal map builders assert on it.
 */
export function pairwiseAlignmentProblem(pa) {
    const transcript = transcriptAlignedSeq(pa);
    const structure = structureAlignedSeq(pa);
    if (transcript.length === 0 || structure.length === 0) {
        return 'The aligned sequences must not be empty';
    }
    if (transcript.length !== structure.length) {
        return `The two aligned sequences must be the same length (got ${transcript.length} and ${structure.length})`;
    }
    return undefined;
}
export function structureSeqVsTranscriptSeqMap(pairwiseAlignment) {
    const problem = pairwiseAlignmentProblem(pairwiseAlignment);
    if (problem) {
        throw new Error(problem);
    }
    const structureSeq = structureAlignedSeq(pairwiseAlignment);
    const transcriptSeq = transcriptAlignedSeq(pairwiseAlignment);
    let j = 0;
    let k = 0;
    const structureSeqToTranscriptSeqPosition = {};
    const transcriptSeqToStructureSeqPosition = {};
    for (let i = 0; i < structureSeq.length; i++) {
        const c1 = structureSeq[i];
        const c2 = transcriptSeq[i];
        if (c2 === '-') {
            j++;
        }
        else if (c1 === '-') {
            k++;
        }
        else {
            structureSeqToTranscriptSeqPosition[j] = k;
            transcriptSeqToStructureSeqPosition[k] = j;
            k++;
            j++;
        }
    }
    return {
        structureSeqToTranscriptSeqPosition,
        transcriptSeqToStructureSeqPosition,
    };
}
function seqPositionToAlignmentMap(seq) {
    const map = {};
    for (let i = 0, j = 0; i < seq.length; i++) {
        if (seq[i] !== '-') {
            map[j] = i;
            j++;
        }
    }
    return map;
}
export function structurePositionToAlignmentMap(pairwiseAlignment) {
    return seqPositionToAlignmentMap(structureAlignedSeq(pairwiseAlignment));
}
export function transcriptPositionToAlignmentMap(pairwiseAlignment) {
    return seqPositionToAlignmentMap(transcriptAlignedSeq(pairwiseAlignment));
}
// see similar function in msaview plugin
export function genomeToTranscriptSeqMapping(feature) {
    return g2p(feature.toJSON());
}
// Enclosing 0-based half-open [start, end) genome span for a codon. getCodonRanges
// returns the codon's separate genomic pieces (multiple when it straddles an
// exon/intron boundary); this collapses them to the outer span for navigation
// and highlighting. undefined when the protein position isn't mapped.
export function codonGenomeSpan(p2gCodon, proteinPos) {
    const ranges = getCodonRanges(p2gCodon, proteinPos);
    return ranges && ranges.length > 0
        ? [Math.min(...ranges.map(r => r[0])), Math.max(...ranges.map(r => r[1]))]
        : undefined;
}
