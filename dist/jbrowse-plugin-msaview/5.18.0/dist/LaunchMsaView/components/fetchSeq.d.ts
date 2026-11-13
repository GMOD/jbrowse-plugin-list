import type { AbstractSessionModel } from '@jbrowse/core/util';
export declare function fetchSeq({ start, end, refName, session, assemblyName, signal, }: {
    start: number;
    end: number;
    refName: string;
    assemblyName: string;
    session: AbstractSessionModel;
    signal: AbortSignal;
}): Promise<{
    seq: string;
    assemblyGeneticCodeId: number;
}>;
