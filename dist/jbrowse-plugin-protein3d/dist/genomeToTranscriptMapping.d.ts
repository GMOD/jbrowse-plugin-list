import { Feature } from '@jbrowse/core/util';
export declare function genomeToTranscriptMapping(feature: Feature): {
    g2p: Record<number, number>;
    p2g: Record<number, number>;
    refName: string;
    strand: number;
};
