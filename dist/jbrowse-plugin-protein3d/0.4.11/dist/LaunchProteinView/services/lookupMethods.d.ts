export interface UniProtEntry {
    accession: string;
    id?: string;
    geneName?: string;
    organismName?: string;
    proteinName?: string;
    isReviewed: boolean;
}
export declare function searchUniProtEntries({ recognizedIds, geneId, geneName, organismId, }: {
    recognizedIds?: string[];
    geneId?: string;
    geneName?: string;
    organismId?: number;
}): Promise<UniProtEntry[]>;
