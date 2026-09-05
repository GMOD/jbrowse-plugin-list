import type { PairwiseAlignment } from '../mappings';
import type { AlignmentAlgorithm } from './types';
/**
 * Whether a structure interaction (hover/click) should drive genome navigation.
 * Only the transcript's mapped entity may — a hover on any other chain carries
 * that chain's own label_seq_id and would mis-map through the wrong alignment.
 * A structure with no resolved mapping (`mappedEntityId` undefined, e.g. a
 * standalone viewer with no transcript) stays fully interactive.
 */
export declare function interactionMatchesMappedEntity(entityId: string, mappedEntityId: string | undefined): boolean;
export interface EntitySelection extends ScoredAlignment {
    /** index into the candidate array of the entity that is the transcript's */
    index: number;
}
export interface ScoredAlignment {
    /** alignment of the transcript against the entity (stop codons stripped on
     * both sides, matching the rest of the mapping pipeline) */
    alignment: PairwiseAlignment;
    /** identical aligned residues */
    matches: number;
    /** the share of the entity's residues the transcript reproduces, the score
     * that picks the entity; see `explainedFraction` */
    explained: number;
}
/** A candidate entity: its sequence, and whether it is DNA/RNA, which is never
 * the transcript's product however its letters happen to align. */
export interface EntityCandidate {
    seq: string;
    nucleicAcid?: boolean;
}
export declare function explainedFraction(matches: number, entityLength: number): number;
/**
 * Align one transcript to one entity, stop codons stripped on both sides. An
 * exact match skips the DP entirely; an oversized pair returns undefined rather
 * than locking up the tab. Used both to score every entity of a structure and
 * to honour a user's explicit chain choice.
 */
export declare function alignTranscriptToEntity(transcript: string, entitySeq: string, algorithm: AlignmentAlgorithm): ScoredAlignment | undefined;
/**
 * Pick which polymer entity of a structure corresponds to the transcript.
 *
 * The plugin historically hardcoded entity `[0]`, which silently mis-maps every
 * heteromeric / protein-DNA / processed-peptide structure where the protein of
 * interest is some other chain. Selecting by alignment makes the structure self-
 * describe which entity is the gene's protein: an exact sequence match wins
 * outright, otherwise the entity the transcript explains the largest share of
 * (see `explainedFraction`). Nucleic-acid entities are never candidates.
 *
 * Returns `undefined` only when there is nothing to map (no transcript or no
 * protein entities) — never a silent fallback to the wrong entity.
 */
export declare function chooseMappedEntity(transcript: string, entities: readonly (string | EntityCandidate)[], algorithm: AlignmentAlgorithm): EntitySelection | undefined;
