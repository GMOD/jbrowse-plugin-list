/**
 * Run a launch fn (sync or async) and surface any thrown error via onError.
 * Used to wrap `session.addView(...)` calls so MST validation errors don't
 * fall silently into the React error boundary.
 */
export declare function safeLaunch(fn: () => unknown, onSuccess?: () => void, onError?: (e: unknown) => void): Promise<void>;
interface LaunchRequirements {
    uniprotId?: string;
    userSelectedProteinSequence?: {
        seq: string;
    };
    selectedTranscript?: unknown;
}
/**
 * The requirements a launch needs, as user-facing reasons for any that are
 * unmet. An empty array means the launch can proceed. Callers decide whether to
 * surface these (e.g. suppressed while loading or while a real upstream error
 * is already shown via <ErrorMessage>, where a duplicate hint would mislead).
 */
export declare function getLaunchMissingReasons({ uniprotId, userSelectedProteinSequence, selectedTranscript, }: LaunchRequirements): string[];
export {};
