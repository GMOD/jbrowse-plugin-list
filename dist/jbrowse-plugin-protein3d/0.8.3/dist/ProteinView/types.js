export const ALIGNMENT_ALGORITHMS = {
    NEEDLEMAN_WUNSCH: 'needleman_wunsch',
    SMITH_WATERMAN: 'smith_waterman',
};
export const DEFAULT_ALIGNMENT_ALGORITHM = 'smith_waterman';
export const ALIGNMENT_ALGORITHM_VALUES = [
    'needleman_wunsch',
    'smith_waterman',
];
/**
 * Parses an untrusted algorithm name (a URL session-spec param) into the union.
 * The only place a coercion is needed: the model property is an enumeration, so
 * everything downstream of hydration is already typed.
 */
export function coerceAlignmentAlgorithm(value) {
    return (ALIGNMENT_ALGORITHM_VALUES.find(v => v === value) ??
        DEFAULT_ALIGNMENT_ALGORITHM);
}
export const ALIGNMENT_ALGORITHM_LABELS = {
    needleman_wunsch: 'Needleman-Wunsch',
    smith_waterman: 'Smith-Waterman',
};
