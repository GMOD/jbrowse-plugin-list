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
    /** absent on rows saved before it was recorded */
    maxHits?: number;
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
/**
 * One history row per distinct search. Every input that changes the stored
 * alignment is in the key, or re-running the query with another aligner or hit
 * count overwrites the earlier row. A part added later is left out at its old
 * value so rows saved before it still resolve: phmmer keys are prefixed and
 * blastp keys are not, and the hit count appears only when it is not the
 * default.
 */
export declare function createCacheKey({ proteinSequence, blastDatabase, msaAlgorithm, searchProgram, transcriptId, maxHits, }: {
    proteinSequence: string;
    blastDatabase: BlastDatabase | PhmmerDatabase;
    msaAlgorithm?: MsaAlgorithm;
    searchProgram?: SearchProgram;
    transcriptId?: string;
    maxHits?: number;
}): string;
/**
 * Record a finished search in the history. Best effort: the alignment is
 * already in hand, and a browser refusing the write must not turn it into a
 * failed launch.
 */
export declare function saveBlastResult({ proteinSequence, blastDatabase, msaAlgorithm, searchProgram, maxHits, msa, tree, treeMetadata, rid, geneId, transcriptId, transcriptName, geneName, }: {
    proteinSequence: string;
    blastDatabase: BlastDatabase | PhmmerDatabase;
    msaAlgorithm?: MsaAlgorithm;
    searchProgram?: SearchProgram;
    maxHits?: number;
    msa: string;
    tree: string;
    treeMetadata: string;
    rid: string;
    geneId?: string;
    transcriptId?: string;
    transcriptName?: string;
    geneName?: string;
}): Promise<CachedBlastResult | undefined>;
export declare function getAllCachedResults(): Promise<CachedBlastResult[]>;
export declare function deleteCachedResult(id: string): Promise<void>;
