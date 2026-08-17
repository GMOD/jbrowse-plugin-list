import { BaseProteinAnnotationAdapter, type ProteinAnnotationRow } from '../BaseProteinAnnotationAdapter';
export interface AlphaFoldConfidenceRow extends ProteinAnnotationRow {
    score: number;
}
interface AlphaFoldConfidenceJson {
    residueNumber: number[];
    confidenceScore: number[];
}
/**
 * Converts AlphaFold confidence JSON to features. residueNumber is 1-based, so
 * residue n becomes the 0-based half-open interval [n-1, n) to line up with the
 * interbase protein reference sequence.
 */
export declare function parseAlphaFoldConfidence(json: AlphaFoldConfidenceJson): AlphaFoldConfidenceRow[];
export default class AlphaFoldConfidenceAdapter extends BaseProteinAnnotationAdapter<AlphaFoldConfidenceRow> {
    protected loadFeatures(): Promise<AlphaFoldConfidenceRow[]>;
}
export {};
