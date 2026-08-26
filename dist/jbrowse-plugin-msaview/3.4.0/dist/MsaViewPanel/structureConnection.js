export function isProteinView(view) {
    const v = view;
    return v.type === 'ProteinView' && Array.isArray(v.structures);
}
/**
 * Extract all ProteinView instances from a session's views array.
 */
export function getProteinViews(views) {
    return views.filter(isProteinView);
}
/**
 * Helper to convert gapped MSA column to ungapped position for a specific row
 */
export function gappedToUngappedPosition(sequence, gappedPosition) {
    if (gappedPosition < 0 || gappedPosition >= sequence.length) {
        return undefined;
    }
    let ungapped = 0;
    for (let i = 0; i < gappedPosition; i++) {
        if (sequence[i] !== '-') {
            ungapped++;
        }
    }
    // If the position itself is a gap, return undefined
    if (sequence[gappedPosition] === '-') {
        return undefined;
    }
    return ungapped;
}
