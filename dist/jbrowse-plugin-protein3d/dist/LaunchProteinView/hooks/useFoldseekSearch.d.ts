import type { FoldseekDatabaseId, FoldseekResult } from '../services/foldseekApi';
export default function useFoldseekSearch(): {
    results: FoldseekResult | undefined;
    cleanedAaSequence: string | undefined;
    di3Sequence: string | undefined;
    isLoading: boolean;
    isPredicting: boolean;
    error: unknown;
    statusMessage: string;
    predictStructure: (aaSequence: string) => Promise<{
        aaSequence: string;
        di3Sequence: string;
    } | undefined>;
    search: (aaSeq: string, di3Seq: string, databases?: FoldseekDatabaseId[]) => Promise<void>;
    reset: () => void;
};
