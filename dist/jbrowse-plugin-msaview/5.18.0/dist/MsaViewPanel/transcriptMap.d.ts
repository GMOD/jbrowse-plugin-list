import { genomeToTranscriptSeqMapping } from 'g2p_mapper';
export declare const MAX_CODING_BASES = 1000000;
export type TranscriptMap = ReturnType<typeof genomeToTranscriptSeqMapping> & {
    codingPositions: number[];
};
/**
 * The genome mapping of the linked transcript, or why there is none. The
 * reason reaches the view's notices: a transcript that does not map leaves
 * every genome link dead with nothing else to say so.
 */
export declare function transcriptMapping(feature: unknown): {
    reason: string;
} | {
    map: {
        codingPositions: number[];
        g2p: Record<number, number>;
        p2g: Record<number, number>;
        p2gCodon: Record<number, number[]>;
        refName: string;
        strand: number;
    };
};
export declare function proteinPositionsInRange(map: Pick<TranscriptMap, 'g2p' | 'codingPositions'>, start: number, end: number): Set<number>;
