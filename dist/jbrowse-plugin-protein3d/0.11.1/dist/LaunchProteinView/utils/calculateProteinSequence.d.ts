import type { AbstractSessionModel, Feature } from '@jbrowse/core/util';
export interface Feat {
    start: number;
    end: number;
    type: string;
    phase?: number;
}
export declare function calculateProteinSequence({ cds, sequence, geneticCodeId, }: {
    cds: Feat[];
    sequence: string;
    geneticCodeId?: number;
}): string;
export declare function getProteinSequence({ feature, seq, assemblyGeneticCodeId, }: {
    seq: string;
    feature: Feature;
    /** the assembly's code for the feature's contig, `{ chrM: 2 }` in hub
     * configs; a transl_table on the feature wins */
    assemblyGeneticCodeId?: number;
}): string;
export declare function fetchProteinSeq({ feature, session, assemblyName, }: {
    feature: Feature;
    session: AbstractSessionModel;
    assemblyName: string | undefined;
}): Promise<string | undefined>;
