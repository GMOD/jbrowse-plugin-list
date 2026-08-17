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
export interface EntitySelection {
    /** index into the entity-sequence array that best matches the transcript */
    index: number;
    /** alignment of the transcript against the chosen entity (stop codons
     * stripped on both sides, matching the rest of the mapping pipeline) */
    alignment: PairwiseAlignment;
    /** identical aligned residues, the score used to pick the entity */
    matches: number;
}
/**
 * Pick which polymer entity of a structure corresponds to the transcript.
 *
 * The plugin historically hardcoded entity `[0]`, which silently mis-maps every
 * heteromeric / protein-DNA / processed-peptide structure where the protein of
 * interest is some other chain. Selecting by alignment makes the structure self-
 * describe which entity is the gene's protein: an exact sequence match wins
 * outright, otherwise the entity with the most identical aligned residues.
 *
 * Returns `undefined` only when there is nothing to map (no transcript or no
 * entities) — never a silent fallback to the wrong entity.
 */
export declare function chooseMappedEntity(transcript: string, entitySeqs: string[], algorithm: AlignmentAlgorithm): EntitySelection | undefined;
