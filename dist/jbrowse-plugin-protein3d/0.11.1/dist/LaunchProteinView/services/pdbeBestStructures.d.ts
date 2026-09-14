export interface PdbStructureEntry {
    pdbId: string;
    experimentalMethod: string;
    /** Å; absent for NMR and some EM entries */
    resolution?: number;
    /** 1-based inclusive UniProt positions the entry covers */
    unpStart: number;
    unpEnd: number;
    /** share of the UniProt sequence the entry covers, 0..1 */
    coverage: number;
    chains: string[];
}
export declare function pdbeBestStructuresUrl(uniprotId: string): string;
export declare function rcsbEntryUrl(pdbId: string): string;
/**
 * Groups the per-chain rows into one entry per PDB id, keeping PDBe's order.
 * An entry whose chains cover different UniProt ranges (a construct
 * crystallised beside a different fragment of itself) keeps its first row's
 * range, which is the one PDBe ranked it by. The response is keyed by
 * accession, so the single entry is taken whatever its key.
 */
export declare function parseBestStructures(json: unknown): PdbStructureEntry[];
