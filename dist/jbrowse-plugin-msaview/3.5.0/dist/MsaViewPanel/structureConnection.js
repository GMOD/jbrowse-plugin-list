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
