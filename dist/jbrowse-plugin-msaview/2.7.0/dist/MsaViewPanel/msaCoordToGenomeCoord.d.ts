import type { MafRegion } from './types';
export declare function msaCoordToGenomeCoord({ model, coord: mouseCol, }: {
    model: {
        querySeqName: string;
        transcriptToMsaMap: {
            refName: string;
            p2g: Record<number, number>;
        } | undefined;
        mafRegion?: MafRegion;
        rows: string[][];
    };
    coord: number;
}): {
    refName: string;
    start: number;
    end: number;
} | undefined;
