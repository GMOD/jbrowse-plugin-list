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
 */
export function getLaunchMissingReasons({ uniprotId, userSelectedProteinSequence, selectedTranscript, }) {
    return [
        !uniprotId && 'No UniProt ID found',
        !userSelectedProteinSequence?.seq &&
            'Could not compute protein sequence (feature may be missing CDS subfeatures)',
        !selectedTranscript && 'No transcript selected',
    ].filter((s) => typeof s === 'string');
}
