export function getProteinViews(session) {
    return session.views.filter(v => v.type === 'ProteinView');
}
/**
 * NOTE: assumes a single ProteinView. Unlike the genome-highlight bridge (which
 * pairs by the declared `connectedViewId`, see getStructuresConnectedTo), a
 * second ProteinView's MSA hover sync is skipped — pairing an MSA to one of
 * several protein views has no reliable rule when the protein view declares
 * neither a connectedMsaViewId nor a connectedViewId.
 */
export function getProteinView(session) {
    return getProteinViews(session)[0];
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
