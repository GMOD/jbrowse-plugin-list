import type { Feat } from './types';
import type { Feature } from '@jbrowse/core/util';
import type { TranslExcept } from '@jbrowse/core/util/geneticCodes';
export declare function calculateProteinSequence({ cds, sequence, geneticCodeId, translExcept, }: {
    cds: Feat[];
    sequence: string;
    geneticCodeId?: number;
    translExcept?: TranslExcept[];
}): string;
export declare function revlist(list: Feat[], seqlen: number): {
    start: number;
    end: number;
    type?: string;
    phase?: number;
}[];
/**
 * The translation core's own feature panel shows: the contig's or the
 * feature's genetic code, its alternative initiators, and any `transl_except`
 * (RefSeq's selenocysteines), read off the transcript or its CDS as core does.
 */
export declare function getProteinSequenceFromFeature({ feature, seq, assemblyGeneticCodeId, }: {
    seq: string;
    feature: Feature;
    /** the assembly's code for the feature's contig, `{ chrM: 2 }` in hub
     * configs; a transl_table on the feature wins */
    assemblyGeneticCodeId?: number;
}): string;
