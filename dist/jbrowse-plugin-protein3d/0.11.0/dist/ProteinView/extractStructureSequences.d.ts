/** A polymer entity of a loaded structure: its mmCIF entity id, its one-letter
 * sequence, and the molstar `label_seq_id` of each of those residues.
 *
 * The entity id is what lets every downstream step talk about "the gene's
 * protein" by identity instead of by the fragile entity-[0] position.
 *
 * `seqIds` is what lets it talk about a *residue* by identity. Structure
 * positions in this plugin are 0-based indices into `seq`; molstar addresses
 * residues by `label_seq_id`. Those are related by `+1` only when the entity's
 * sequence covers every residue from 1 — true for any mmCIF with an
 * `entity_poly_seq` category (all of RCSB and AlphaFold) and for PDB files
 * carrying SEQRES records, because molstar synthesizes the category from them.
 *
 * A PDB-format file with no SEQRES has no such category, so molstar falls back
 * to `StructureSequence.fromHierarchy` and takes `label_seq_id` straight from
 * the observed residues' author numbering: a chain whose coordinates start at
 * residue 94 yields seqIds 94.., and an unobserved loop leaves a hole. Deriving
 * the id arithmetically there is off by the whole offset, in both directions —
 * every hover reads the wrong residue and every highlight paints the wrong one.
 * So carry the real ids and convert through them.
 */
export interface Entity {
    entityId: string;
    seq: string;
    seqIds: number[];
    /** author chain ids carrying this entity, e.g. ['A', 'B'] for a homodimer;
     * what a user recognises from the PDB entry page, where the entity id is
     * molstar's own bookkeeping */
    chains: string[];
    /** DNA, RNA or a hybrid, by molstar's entity subtype. Its one-letter
     * sequence spells amino acids too (A, C, G, T, U), so it has to be kept
     * out of the transcript alignment rather than merely scoring low. */
    nucleicAcid?: boolean;
    /** `auth_seq_id` per position: the numbering the depositors chose, which
     * for an RCSB entry is the one papers and UniProt cite (1TUP's position 154
     * is R248) and what Mol*'s own hover label shows. Display only; every
     * coordinate the plugin computes with stays a 0-based position, and molstar
     * is addressed through `seqIds`. Absent when the model has no atomic
     * hierarchy to read it from. See `residueNumber`. */
    authSeqIds?: number[];
}
interface Column<T> {
    rowCount: number;
    value(row: number): T;
}
interface StructureModel {
    obj?: {
        data: {
            entities?: {
                subtype: Column<string>;
                getEntityIndex(id: string): number;
            };
            sequence: {
                sequences: readonly {
                    entityId: string;
                    sequence: {
                        label: {
                            toArray(): ArrayLike<string>;
                        };
                        seqId: {
                            toArray(): ArrayLike<number>;
                        };
                    };
                }[];
            };
            atomicHierarchy?: {
                chains: {
                    label_entity_id: Column<string>;
                    auth_asym_id: Column<string>;
                };
                residues?: {
                    label_seq_id: Column<number>;
                    auth_seq_id: Column<number>;
                };
                residueAtomSegments?: {
                    offsets: ArrayLike<number>;
                    count: number;
                };
                chainAtomSegments?: {
                    index: ArrayLike<number>;
                };
            };
        };
    };
}
/**
 * Author numbering for every SEQRES position, observed or not. A residue with
 * no atoms has no auth_seq_id of its own, so it takes the offset of the nearest
 * observed residue before it (after it, at an unobserved N-terminus): a
 * disordered loop keeps counting the way the paper does. With nothing observed
 * the label numbering stands.
 */
export declare function fillAuthSeqIds(seqIds: number[], observed: Map<number, number> | undefined): number[];
/** The number a residue is called by: author numbering when the file carries
 * it, else molstar's label_seq_id, which is the author numbering already for a
 * SEQRES-less PDB and 1..N for everything else. */
export declare function residueNumber(entity: Entity | undefined, pos: number): number;
/**
 * The 0-based half-open position range covering an inclusive range of author
 * residue numbers, the form a paper or a spec names a site by ("R248",
 * "residues 102-292"). Undefined when no residue of the entity carries a number
 * in the range, so a typo selects nothing rather than something else.
 */
export declare function residueRangeToPositions(entity: Entity | undefined, range: {
    start: number;
    end: number;
}): {
    start: number;
    end: number;
} | undefined;
export declare function extractEntities(model: StructureModel): Entity[] | undefined;
/** A user-facing name for an entity: its chains when known, else its id. */
export declare function entityLabel(entity: Entity): string;
/** Back-compat helper for callers that only need the sequence strings (e.g. the
 * launch dialog's isoform matching). */
export declare function extractStructureSequences(model: StructureModel): string[] | undefined;
/**
 * The molstar `label_seq_id`s for a set of 0-based structure positions. Unknown
 * positions are dropped rather than guessed, so an out-of-range position paints
 * nothing instead of painting something wrong.
 */
export declare function toLabelSeqIds(entity: Entity | undefined, positions: Iterable<number>): number[];
/** As toLabelSeqIds, for a half-open [start, end) structure-position range. */
export declare function rangeToLabelSeqIds(entity: Entity | undefined, range: {
    start: number;
    end: number;
} | undefined): number[];
/** Reverse of `seqIds`: molstar's label_seq_id -> 0-based structure position. */
export declare function makeLabelSeqIdIndex(entity: Entity | undefined): Map<number, number>;
export {};
