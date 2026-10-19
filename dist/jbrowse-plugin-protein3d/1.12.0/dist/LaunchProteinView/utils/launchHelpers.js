/**
 * Run a launch fn (sync or async) and surface any thrown error via onError.
 * Used to wrap `session.addView(...)` calls so MST validation errors don't
 * fall silently into the React error boundary.
 */
export async function safeLaunch(fn, onSuccess, onError) {
    try {
        await fn();
        onSuccess?.();
    }
    catch (e) {
        console.error(e);
        onError?.(e);
    }
}
/**
 * The requirements a launch needs, as user-facing reasons for any that are
 * unmet. An empty array means the launch can proceed. Callers decide whether to
 * surface these (e.g. suppressed while loading or while a real upstream error
 * is already shown via <ErrorMessage>, where a duplicate hint would mislead).
 *
 * A launch that names its own structure needs no accession. Bypassing a lookup
 * that failed or resolved the wrong gene is the whole point of typing a PDB id,
 * and the view resolves SIFTS from the entry itself; the accession only feeds
 * the feature tracks and the view's name, both of which do without it. On the
 * AlphaFold tab the url is derived from the accession, so no accession means
 * no url either; `useAlphaFoldData` makes sure of it.
 */
export function getLaunchMissingReasons({ uniprotId, userSelectedProteinSequence, selectedTranscript, url, pdbId, }) {
    const namesOwnStructure = !!url || !!pdbId;
    return [
        !namesOwnStructure && !uniprotId && 'No UniProt ID found',
        !userSelectedProteinSequence?.seq &&
            'Could not compute protein sequence (feature may be missing CDS subfeatures)',
        !selectedTranscript && 'No transcript selected',
        !namesOwnStructure && 'No structure selected',
    ].filter((s) => typeof s === 'string');
}
