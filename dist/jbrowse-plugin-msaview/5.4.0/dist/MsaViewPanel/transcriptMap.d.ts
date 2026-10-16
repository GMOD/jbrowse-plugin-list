import { genomeToTranscriptSeqMapping } from 'g2p_mapper';
export declare const MAX_CODING_BASES = 1000000;
export type TranscriptMap = ReturnType<typeof genomeToTranscriptSeqMapping> & {
    codingPositions: number[];
};
export declare function transcriptMap(feature: unknown): TranscriptMap | undefined;
export declare function proteinPositionsInRange(map: Pick<TranscriptMap, 'g2p' | 'codingPositions'>, start: number, end: number): Set<number>;
