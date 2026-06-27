import type { Feat } from './types';
import type { Feature } from '@jbrowse/core/util';
export declare function stitch(subfeats: Feat[], sequence: string): string;
export declare function calculateProteinSequence({ cds, sequence, codonTable, }: {
    cds: Feat[];
    sequence: string;
    codonTable: Record<string, string>;
}): string;
export declare function revlist(list: Feat[], seqlen: number): {
    start: number;
    end: number;
    type?: string;
}[];
export declare function getProteinSequenceFromFeature({ feature, seq, }: {
    seq: string;
    feature: Feature;
}): string;
