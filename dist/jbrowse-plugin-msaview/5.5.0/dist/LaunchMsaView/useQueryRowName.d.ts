/**
 * The MSA row name to launch with, found by sequence rather than typed.
 *
 * Only the user's override is state. The detected name is derived from the
 * pasted text during render, so pasting a new alignment re-detects without an
 * effect writing back into state, and an override survives later edits to the
 * alignment because it is the one thing actually stored.
 */
/**
 * The row to launch with. Detection by residues is the answer wherever it has
 * one -- aligners rename the query on the way through, so a name proves
 * nothing -- but a caller with a naming convention of its own can offer it as a
 * fallback, and it is taken only when the alignment really carries that row.
 * An empty result means there is no query row, which a launch has to refuse:
 * the view opens, renders, and then never navigates.
 */
export declare function resolveQueryRowName(queryRow: {
    querySeqName: string;
    names: string[];
}, fallback: string): string;
export declare function useQueryRowName(msaText: string, proteinSequence: string): {
    detected: import("./detectQueryRow").QueryRowMatch | undefined;
    names: string[];
    querySeqName: string;
    querySeqOffset: number;
    setQuerySeqName: import("react").Dispatch<import("react").SetStateAction<string | undefined>>;
    isAutoDetected: boolean;
};
