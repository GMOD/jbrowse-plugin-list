/**
 * The MSA row name to launch with, found by sequence rather than typed.
 *
 * Only the user's override is state. The detected name is derived from the
 * pasted text during render, so pasting a new alignment re-detects without an
 * effect writing back into state, and an override survives later edits to the
 * alignment because it is the one thing actually stored.
 */
export declare function useQueryRowName(msaText: string, proteinSequence: string): {
    detected: import("./detectQueryRow").QueryRowMatch | undefined;
    names: string[];
    querySeqName: string;
    setQuerySeqName: import("react").Dispatch<import("react").SetStateAction<string | undefined>>;
    isAutoDetected: boolean;
};
