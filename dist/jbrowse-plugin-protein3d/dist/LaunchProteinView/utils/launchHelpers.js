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
 * Compute user-facing reasons the Launch button is disabled. Suppressed
 * while loading or while a real upstream error is being displayed.
 */
export function getLaunchMissingReasons({ uniprotId, userSelectedProteinSequence, selectedTranscript, isLoading, error, }) {
    if (isLoading || error) {
        return [];
    }
    return [
        !uniprotId && 'No UniProt ID found',
        !userSelectedProteinSequence &&
            'Could not compute protein sequence (feature may be missing CDS subfeatures)',
        !selectedTranscript && 'No transcript selected',
    ].filter((s) => typeof s === 'string');
}
