import { genomeToTranscriptSeqMapping as g2p } from 'g2p_mapper';
export function structureSeqVsTranscriptSeqMap(pairwiseAlignment) {
    const structureSeq = pairwiseAlignment.alns[1].seq;
    const transcriptSeq = pairwiseAlignment.alns[0].seq;
    if (structureSeq.length !== transcriptSeq.length) {
        throw new Error('mismatched length');
    }
    let j = 0;
    let k = 0;
    const structureSeqToTranscriptSeqPosition = {};
    const transcriptSeqToStructureSeqPosition = {};
    for (let i = 0; i < structureSeq.length; i++) {
        const c1 = structureSeq[i];
        const c2 = transcriptSeq[i];
        if (c1 === c2) {
            structureSeqToTranscriptSeqPosition[j] = k;
            transcriptSeqToStructureSeqPosition[k] = j;
            k++;
            j++;
        }
        else if (c2 === '-') {
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
export function structurePositionToAlignmentMap(pairwiseAlignment) {
    const structureSeq = pairwiseAlignment.alns[1].seq;
    const structurePositionToAlignment = {};
    for (let i = 0, j = 0; i < structureSeq.length; i++) {
        if (structureSeq[i] !== '-') {
            structurePositionToAlignment[j] = i;
            j++;
        }
    }
    return structurePositionToAlignment;
}
export function transcriptPositionToAlignmentMap(pairwiseAlignment) {
    const transcriptSeq = pairwiseAlignment.alns[0].seq;
    const transcriptPositionToAlignment = {};
    for (let i = 0, j = 0; i < transcriptSeq.length; i++) {
        if (transcriptSeq[i] !== '-') {
            transcriptPositionToAlignment[j] = i;
            j++;
        }
    }
    return transcriptPositionToAlignment;
}
// see similar function in msaview plugin
export function genomeToTranscriptSeqMapping(feature) {
    // @ts-expect-error
    return g2p(feature.toJSON());
}
//# sourceMappingURL=mappings.js.map