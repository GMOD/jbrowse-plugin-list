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
 * Whether a 3D structure belongs to a given alignment — the single source of
 * truth for pairing an MsaView with a ProteinView's structure. A structure
 * matches when it either:
 *  - shares the alignment's genome view (both pinned to the same
 *    LinearGenomeView via `connectedViewId` — the genome-centric gene-explorer
 *    flow, the same key genome↔MSA and genome↔structure already bridge through),
 *    or
 *  - shares the alignment's UniProt accession (the BLAST/AlphaFold flow, which
 *    has no genome view to bridge through).
 *
 * The residue map itself is built by sequence (connectToStructure pairwise-
 * aligns the query row against the structure), so neither key is mechanically
 * required — they only scope WHICH structure pairs with the alignment.
 */
export function structureMatchesMsa({ structure, connectedViewId, uniprotId, }) {
    const sharesGenomeView = !!connectedViewId && structure.connectedViewId === connectedViewId;
    const sharesUniprot = !!uniprotId && structure.uniprotId === uniprotId;
    return sharesGenomeView || sharesUniprot;
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
