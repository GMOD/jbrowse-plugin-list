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
export declare function fetchProteinSeq({ feature, session, assemblyName, }: {
    feature: Feature;
    session: AbstractSessionModel;
    assemblyName: string | undefined;
}): Promise<string | undefined>;
