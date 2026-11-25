import { isRecord } from './util';
export function isProteinView(view) {
    return (isRecord(view) &&
        view.type === 'ProteinView' &&
        Array.isArray(view.structures));
}
/**
 * Extract all ProteinView instances from a session's views array.
 */
export function getProteinViews(views) {
    return views.filter(isProteinView);
}
