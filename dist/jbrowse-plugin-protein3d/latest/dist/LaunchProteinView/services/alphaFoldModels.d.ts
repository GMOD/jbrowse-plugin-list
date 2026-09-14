import type { IsoformSequences } from '../utils/util';
export interface AlphaFoldModel {
    /** UniProt accession, with an isoform suffix on an isoform model */
    accession: string;
    url: string;
    confidenceUrl?: string;
    sequence: string;
}
export declare function parseAlphaFoldModels(json: unknown): AlphaFoldModel[];
/**
 * Every model AlphaFold DB has for an accession: the canonical one and any
 * isoform models, each with its file url and sequence. Asked rather than
 * derived from the accession, because a derived `AF-<acc>-F1-model_v6` does
 * not exist past the length cap (dystrophin has fourteen isoform models and no
 * F1) and moves with every model version. An accession AlphaFold has never
 * folded answers 400 or 404, which is no models rather than an error.
 */
export declare function fetchAlphaFoldModels(uniprotId: string): Promise<AlphaFoldModel[]>;
/**
 * The model to open for a gene's transcripts: one folded from exactly a
 * transcript's translation, canonical first, so the view maps it as an
 * identity; else the canonical model; else the longest isoform model.
 */
export declare function pickAlphaFoldModel(models: AlphaFoldModel[], isoformSequences: IsoformSequences | undefined): AlphaFoldModel | undefined;
