/**
 * Run a launch fn (sync or async) and surface any thrown error via onError.
 * Used to wrap `session.addView(...)` calls so MST validation errors don't
 * fall silently into the React error boundary.
 */
export declare function safeLaunch(fn: () => void | Promise<void>, onSuccess?: () => void, onError?: (e: unknown) => void): Promise<void>;
interface LaunchRequirements {
    uniprotId?: string;
    userSelectedProteinSequence?: {
        seq: string;
    };
    selectedTranscript?: unknown;
    isLoading?: boolean;
    /**
     * If a real error already surfaced (e.g. from UniProt lookup), suppress the
     * derived "No UniProt ID found" reason — the underlying error is already
     * shown via <ErrorMessage> and the duplicate hint is misleading.
     */
    error?: unknown;
}
/**
 * Compute user-facing reasons the Launch button is disabled. Suppressed
 * while loading or while a real upstream error is being displayed.
 */
export declare function getLaunchMissingReasons({ uniprotId, userSelectedProteinSequence, selectedTranscript, isLoading, error, }: LaunchRequirements): string[];
export {};
