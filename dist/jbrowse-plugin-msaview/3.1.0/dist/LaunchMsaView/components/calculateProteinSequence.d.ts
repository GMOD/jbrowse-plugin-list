import type { Feat } from './types';
import type { Feature } from '@jbrowse/core/util';
export declare function calculateProteinSequence({ cds, sequence, geneticCodeId, }: {
    cds: Feat[];
    sequence: string;
    geneticCodeId?: number;
}): string;
export declare function revlist(list: Feat[], seqlen: number): {
    start: number;
    end: number;
    type?: string;
    phase?: number;
}[];
export declare function getProteinSequenceFromFeature({ feature, seq, }: {
    seq: string;
    feature: Feature;
}): string;
