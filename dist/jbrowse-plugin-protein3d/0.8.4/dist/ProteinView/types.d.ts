export type AlignmentAlgorithm = 'needleman_wunsch' | 'smith_waterman';
export declare const ALIGNMENT_ALGORITHMS: {
    readonly NEEDLEMAN_WUNSCH: "needleman_wunsch";
    readonly SMITH_WATERMAN: "smith_waterman";
};
export declare const DEFAULT_ALIGNMENT_ALGORITHM: AlignmentAlgorithm;
export declare const ALIGNMENT_ALGORITHM_VALUES: AlignmentAlgorithm[];
/**
 * Parses an untrusted algorithm name (a URL session-spec param) into the union.
 * The only place a coercion is needed: the model property is an enumeration, so
 * everything downstream of hydration is already typed.
 */
export declare function coerceAlignmentAlgorithm(value: string): AlignmentAlgorithm;
export declare const ALIGNMENT_ALGORITHM_LABELS: Record<AlignmentAlgorithm, string>;
