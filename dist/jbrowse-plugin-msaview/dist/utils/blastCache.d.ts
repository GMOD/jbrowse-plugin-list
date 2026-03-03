export interface CachedBlastResult {
    id: string;
    proteinSequence: string;
    blastDatabase: string;
    blastProgram: string;
    msaAlgorithm: string;
    msa: string;
    tree: string;
    treeMetadata: string;
    rid: string;
    timestamp: number;
    geneId?: string;
    transcriptId?: string;
    transcriptName?: string;
    geneName?: string;
}
export declare function getCachedBlastResult({ proteinSequence, blastDatabase, blastProgram, transcriptId, }: {
    proteinSequence: string;
    blastDatabase: string;
    blastProgram: string;
    transcriptId?: string;
}): Promise<any>;
export declare function saveBlastResult({ proteinSequence, blastDatabase, blastProgram, msaAlgorithm, msa, tree, treeMetadata, rid, geneId, transcriptId, transcriptName, geneName, }: {
    proteinSequence: string;
    blastDatabase: string;
    blastProgram: string;
    msaAlgorithm: string;
    msa: string;
    tree: string;
    treeMetadata: string;
    rid: string;
    geneId?: string;
    transcriptId?: string;
    transcriptName?: string;
    geneName?: string;
}): Promise<CachedBlastResult>;
export declare function getAllCachedResults(): Promise<any[]>;
export declare function getCachedResultsByGeneId(geneId: string): Promise<any[]>;
export declare function deleteCachedResult(id: string): Promise<void>;
export declare function clearAllCachedResults(): Promise<void>;
