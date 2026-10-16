import type { MafRegion } from './types';
interface GenomeRegion {
    refName: string;
    start: number;
    end: number;
}
interface CoordModel {
    querySeqName: string;
    transcriptToMsaMap: {
        refName: string;
        p2gCodon: Record<number, number[]>;
    } | undefined;
    mafRegion?: MafRegion;
    /** transcript residues before the query row's first residue */
    querySeqOffset?: number;
    /**
     * react-msaview's converter, which is the only thing that knows which columns
     * are on screen. `rows` carries the whole gapped alignment, so counting
     * residues along one of them answers for a column index the user cannot
     * produce once `hideGaps` drops columns -- and it drops them as soon as a
     * clade collapses or allowedGappyness falls below 100.
     */
    visibleColToSeqPos: (rowName: string, visibleCol: number) => number | undefined;
}
/**
 * The genome regions covered by MSA column `coord` of the query row, in 0-based
 * half-open coordinates (what bpToPx and navTo take).
 *
 * `coord` is a VISIBLE column -- what mouseCol and mouseClickCol carry.
 *
 * Usually one region -- one codon, or one base in a MAF alignment -- but a
 * codon split across an exon boundary yields one region per contiguous piece,
 * which is why this returns a list.
 */
export declare function msaCoordToGenomeRegions({ model, coord: mouseCol, }: {
    model: CoordModel;
    coord: number;
}): GenomeRegion[];
/**
 * A single region spanning the codon at MSA column `coord`, for navigation. For
 * a codon split across an exon boundary this spans the intervening intron.
 */
export declare function msaCoordToGenomeCoord(args: {
    model: CoordModel;
    coord: number;
}): GenomeRegion | undefined;
export {};
