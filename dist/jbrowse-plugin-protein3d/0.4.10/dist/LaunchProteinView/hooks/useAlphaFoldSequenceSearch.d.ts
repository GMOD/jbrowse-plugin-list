export type SequenceSearchType = 'md5' | 'sequence';
interface SequenceSummaryResponse {
    entryId?: string;
    uniprotAccession?: string;
    uniprotId?: string;
    uniprotDescription?: string;
    taxId?: number;
    organismScientificName?: string;
    uniprotStart?: number;
    uniprotEnd?: number;
    modelUrl?: string;
    cifUrl?: string;
    plddtDocUrl?: string;
    sequence?: string;
}
export default function useAlphaFoldSequenceSearch({ sequence, searchType, enabled, }: {
    sequence?: string;
    searchType: SequenceSearchType;
    enabled?: boolean;
}): {
    isLoading: boolean;
    result: SequenceSummaryResponse | undefined;
    uniprotId: string | undefined;
    cifUrl: string | undefined;
    plddtDocUrl: string | undefined;
    structureSequence: string | undefined;
    error: any;
};
export {};
