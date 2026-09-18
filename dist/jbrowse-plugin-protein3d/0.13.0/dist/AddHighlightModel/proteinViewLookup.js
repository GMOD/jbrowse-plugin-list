export function getProteinViews(session) {
    return session.views.filter(v => v.type === 'ProteinView');
}
/**
 * Every structure across all ProteinViews that declares this genome view as its
 * connection. Structures are paired to a genome view explicitly, so a second
 * LinearGenomeView doesn't mirror another view's highlights (the coordinates
 * would be meaningless there, possibly on a different assembly), and a second
 * ProteinView isn't ignored.
 */
export function getStructuresConnectedTo(proteinViews, viewId) {
    return proteinViews.flatMap(view => view.structures.filter(s => s.connectedViewId === viewId));
}
