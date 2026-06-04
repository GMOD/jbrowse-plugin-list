export const ALIGNMENT_ALGORITHMS = {
    NEEDLEMAN_WUNSCH: 'needleman_wunsch',
    SMITH_WATERMAN: 'smith_waterman',
};
export const DEFAULT_ALIGNMENT_ALGORITHM = 'smith_waterman';
const ALIGNMENT_ALGORITHM_VALUES = [
    'needleman_wunsch',
    'smith_waterman',
];
export function coerceAlignmentAlgorithm(value) {
    return (ALIGNMENT_ALGORITHM_VALUES.find(v => v === value) ??
        DEFAULT_ALIGNMENT_ALGORITHM);
}
export const ALIGNMENT_ALGORITHM_LABELS = {
    needleman_wunsch: 'Needleman-Wunsch',
    smith_waterman: 'Smith-Waterman',
};
