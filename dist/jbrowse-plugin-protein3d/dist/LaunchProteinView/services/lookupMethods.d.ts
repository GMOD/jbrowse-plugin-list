import { isRecognizedDatabaseId } from '../utils/util';
export interface UniProtEntry {
    accession: string;
    id?: string;
    geneName?: string;
    organismName?: string;
    proteinName?: string;
    isReviewed: boolean;
}
export { isRecognizedDatabaseId as isRecognizedTranscriptId };
/**
 * Search UniProt for entries matching a gene, returning multiple results.
 * Tries multiple strategies in order of specificity:
 * 1. Recognized database IDs (Ensembl, RefSeq, CCDS, HGNC) via xref search
 * 2. Gene name search (fallback if no reviewed entries found)
 */
export declare function searchUniProtEntries({ recognizedIds, geneId, geneName, organismId, }: {
    recognizedIds?: string[];
    geneId?: string;
    geneName?: string;
    organismId?: number;
}): Promise<UniProtEntry[]>;
