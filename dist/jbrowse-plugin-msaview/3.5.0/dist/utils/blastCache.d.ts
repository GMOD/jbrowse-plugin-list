import type { BlastDatabase, MsaAlgorithm, PhmmerDatabase, SearchProgram } from '../LaunchMsaView/components/BlastQuery/consts';
export interface CachedBlastResult {
    id: string;
    proteinSequence: string;
    blastDatabase: BlastDatabase | PhmmerDatabase;
    /**
     * Only ever set on rows cached by a version that still queried NCBI, where
     * the choice between blastp and quick-blastp was real. Kept so those rows
     * still display; never written now.
     */
    blastProgram?: string;
    /** absent on rows cached before phmmer existed, which were all blastp */
    searchProgram?: SearchProgram;
    /** absent on phmmer rows, which are aligned by the search itself */
    msaAlgorithm?: MsaAlgorithm;
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
export declare function saveBlastResult({ proteinSequence, blastDatabase, msaAlgorithm, searchProgram, msa, tree, treeMetadata, rid, geneId, transcriptId, transcriptName, geneName, }: {
    proteinSequence: string;
    blastDatabase: BlastDatabase | PhmmerDatabase;
    msaAlgorithm?: MsaAlgorithm;
    searchProgram?: SearchProgram;
    msa: string;
    tree: string;
    treeMetadata: string;
    rid: string;
    geneId?: string;
    transcriptId?: string;
    transcriptName?: string;
    geneName?: string;
}): Promise<CachedBlastResult>;
export declare function getAllCachedResults(): Promise<CachedBlastResult[]>;
export declare function deleteCachedResult(id: string): Promise<void>;
