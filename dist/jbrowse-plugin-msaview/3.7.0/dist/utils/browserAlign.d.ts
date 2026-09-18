/**
 * One target against the query, as the pieces the merge needs: the target
 * residue (or gap) under each query residue, and the target residues inserted
 * before each query residue -- `inserts[query.length]` being what follows the
 * last one.
 */
export interface QueryAnchored {
    matched: string[];
    inserts: string[];
}
/**
 * Gotoh's affine-gap alignment with free end gaps on both sequences. Three
 * states -- M pairs two residues, X puts a query residue against a gap, Y puts
 * a target residue against a gap -- with rolling score rows and one byte of
 * traceback per state per cell.
 */
export declare function alignToQuery(query: string, target: string): QueryAnchored;
export interface NamedSequence {
    name: string;
    sequence: string;
}
/** Merge per-target alignments on the query into one set of equal-length rows. */
export declare function mergeOnQuery(query: NamedSequence, aligned: {
    name: string;
    alignment: QueryAnchored;
}[]): {
    name: string;
    sequence: string;
}[];
/**
 * Align `targets` to `query` in the browser and return the rows as FASTA, the
 * query first. Yields between batches so the UI stays responsive; the returned
 * FASTA is what the rest of the launch pipeline expects an aligner to produce.
 */
export declare function alignInBrowser({ query, targets, onProgress, signal, }: {
    query: NamedSequence;
    targets: NamedSequence[];
    onProgress?: (arg: string) => void;
    signal?: AbortSignal;
}): Promise<string>;
/** The first record is the query, the rest the targets: the shape every launch submits. */
export declare function parseFastaRecords(text: string): NamedSequence[];
