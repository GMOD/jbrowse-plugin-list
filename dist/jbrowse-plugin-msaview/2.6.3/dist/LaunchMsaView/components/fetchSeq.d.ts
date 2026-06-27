import type { AbstractSessionModel } from '@jbrowse/core/util';
export declare function fetchSeq({ start, end, refName, session, assemblyName, }: {
    start: number;
    end: number;
    refName: string;
    assemblyName: string;
    session: AbstractSessionModel;
}): Promise<string>;
