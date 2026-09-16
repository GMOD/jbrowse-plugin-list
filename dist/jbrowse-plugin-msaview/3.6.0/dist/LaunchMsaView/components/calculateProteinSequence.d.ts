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
export declare function getProteinSequenceFromFeature({ feature, seq, assemblyGeneticCodeId, }: {
    seq: string;
    feature: Feature;
    /** the assembly's code for the feature's contig, `{ chrM: 2 }` in hub
     * configs; a transl_table on the feature wins */
    assemblyGeneticCodeId?: number;
}): string;
