import { Feature } from '@jbrowse/core/util';
export interface Feat {
    start: number;
    end: number;
    type: string;
}
export declare function stitch(subfeats: Feat[], sequence: string): string;
export declare function calculateProteinSequence({ cds, sequence, codonTable, }: {
    cds: Feat[];
    sequence: string;
    codonTable: Record<string, string>;
}): string;
export declare function revlist(list: Feat[], seqlen: number): {
    start: number;
    end: number;
    type: string;
}[];
export declare function dedupe(list: Feat[]): Feat[];
export declare function getProteinSequence({ feature, seq, }: {
    seq: string;
    feature: Feature;
}): string;
export declare function fetchProteinSeq({ feature, view, }: {
    feature: Feature;
    view: {
        assemblyNames?: string[];
    } | undefined;
}): Promise<string | undefined>;
