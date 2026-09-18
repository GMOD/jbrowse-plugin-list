/**
 * Whether `querySeqName` names a row this alignment actually has. The name
 * defaults to `QUERY`, which an uploaded alignment has no reason to carry, so
 * the genome and structure hovers ask this before mapping anything.
 *
 * `rowMap`, not `rows`: `rows` is what is on screen, and a query row folded
 * into a collapsed clade is still in the alignment, still has its columns, and
 * still maps.
 */
export function hasQueryRow(model) {
    return model.rowMap.has(model.querySeqName);
}
/**
 * Read the transcript's fields whichever shape it arrived in: a caller inside
 * the session may still hand over a live Feature.
 */
export function transcriptFields(transcript) {
    if (!transcript) {
        return {};
    }
    return typeof transcript.toJSON === 'function'
        ? transcript.toJSON()
        : transcript;
}
function str(val) {
    return typeof val === 'string' ? val : undefined;
}
/** what a transcript is called, preferring its name over its id */
export function transcriptName(transcript) {
    const fields = transcriptFields(transcript);
    return str(fields.name) ?? str(fields.id);
}
/**
 * The visible column showing residue `seqPos` (0-based) of the query row, or
 * undefined when the row does not carry that residue or react-msaview is
 * hiding its column.
 *
 * react-msaview answers one column past the end for a position the row does not
 * have, which would light the last column for every residue beyond the row, so
 * the round trip back through visibleColToSeqPos is what rejects those.
 */
export function querySeqPosToVisibleCol(model, seqPos) {
    const { querySeqName } = model;
    if (seqPos < 0) {
        return undefined;
    }
    const col = model.seqPosToVisibleCol(querySeqName, seqPos);
    return col !== undefined &&
        model.visibleColToSeqPos(querySeqName, col) === seqPos
        ? col
        : undefined;
}
/**
 * The visible column showing residue `proteinPos` (0-based) of the transcript.
 * `querySeqOffset` is what separates the two: a pasted BLAST alignment carries
 * the aligned region, not the whole protein.
 */
export function transcriptPosToVisibleCol(model, proteinPos) {
    return querySeqPosToVisibleCol(model, proteinPos - model.querySeqOffset);
}
export function hasHoverPosition(hovered) {
    return (!!hovered &&
        typeof hovered === 'object' &&
        'hoverPosition' in hovered &&
        !!hovered.hoverPosition);
}
/**
 * Extracts UniProt ID from an AlphaFold URL
 * Examples:
 * - https://alphafold.ebi.ac.uk/files/AF-P12345-F1-model_v6.cif -> P12345
 * - https://alphafold.ebi.ac.uk/files/msa/AF-P12345-F1-msa_v6.a3m -> P12345
 */
export function getUniprotIdFromAlphaFoldUrl(url) {
    const match = /AF-([A-Z0-9]+)-F\d+/.exec(url);
    return match?.[1];
}
