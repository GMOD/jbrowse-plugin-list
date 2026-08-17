export declare function uniprotGffUrl(uniprotId: string): string;
export declare function uniprotFastaUrl(uniprotId: string): string;
export declare function uniprotEntryUrl(uniprotId: string): string;
export declare function getAlphaFoldStructureUrl(uniprotId: string, version?: string): string;
export declare function getAlphaFoldConfidenceUrl(uniprotId: string, version?: string): string;
export declare function getAlphaFoldMsaUrl(uniprotId: string, version?: string): string;
export declare function getPdbStructureUrl(pdbId: string): string;
/**
 * Resolve the `{ uniprotId }` / `{ pdbId }` shorthand to a concrete structure
 * URL, so a hand-authored snapshot or a short launch URL doesn't have to know
 * the AlphaFold/RCSB filename formats.
 *
 * An explicit `url` (or inline `data`) always wins, and the shorthand resolves
 * the canonical form only — AlphaFold's F1 fragment, RCSB's mmCIF. Idempotent:
 * re-resolving an already-resolved spec returns the same url.
 *
 * Shared by the Structure model's snapshot preprocessor and the
 * LaunchView-ProteinView extension point, which would otherwise each carry
 * their own copy of the same precedence rule and drift on which ids they
 * accept — the extension point took uniprotId but not pdbId for exactly that
 * reason.
 */
export declare function resolveStructureUrl({ url, data, uniprotId, pdbId, }: {
    url?: string;
    data?: string;
    uniprotId?: string;
    pdbId?: string;
}): string | undefined;
/**
 * The PDB id of a structure URL from the PDB archive, lowercased, or undefined
 * for any other URL. Accepts the filename forms those hosts serve, e.g.
 * `1TUP.cif`, `pdb1tup.ent.gz`, `1tup_updated.cif`.
 */
export declare function getPdbIdFromUrl(url: string): string | undefined;
export declare function getUniprotIdFromAlphaFoldTarget(target: string): string | undefined;
export declare function getStructureUrlFromTarget(target: string, db: string): string | undefined;
export declare function getConfidenceUrlFromTarget(target: string): string | undefined;
