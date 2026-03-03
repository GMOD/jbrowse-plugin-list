export type AlignmentAlgorithm = 'needleman_wunsch' | 'smith_waterman';
export declare const ALIGNMENT_ALGORITHMS: {
    readonly NEEDLEMAN_WUNSCH: "needleman_wunsch";
    readonly SMITH_WATERMAN: "smith_waterman";
};
export declare const DEFAULT_ALIGNMENT_ALGORITHM: AlignmentAlgorithm;
export declare const ALIGNMENT_ALGORITHM_LABELS: Record<string, string>;
