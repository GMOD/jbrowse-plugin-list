import type { Feature } from '@jbrowse/core/util';
/**
 * Drop the terminal stop codon(s) from a translated protein sequence.
 *
 * Only trailing `*` go: an interior stop (mis-annotated CDS, selenoprotein
 * read-through) occupies a real codon position, and deleting it would shift
 * every later residue out of step with g2p's codon-indexed transcript
 * coordinates — offsetting every genome↔structure hover past that point.
 */
export declare function stripStopCodon(seq: string): string;
/**
 * Strip every stop codon, including interior ones. Only for sequences handed to
 * an external similarity search (Foldseek, AlphaFold), where `*` is not a valid
 * query character and no coordinate depends on the result's positions.
 */
export declare function stripAllStopCodons(seq: string): string;
/**
 * Pull an NCBI taxon id out of reference-sequence-track metadata. jb2hubs
 * assemblies expose it differently by source: UCSC golden-path spreads it flat
 * (`metadata.taxId`), GenArk nests the raw hub stanza (`metadata.ucsc.taxId`).
 * `taxonId` is accepted too. Returns a positive integer, or undefined when
 * absent/unparseable so callers can fall back to a default organism.
 */
export declare function extractTaxonId(metadata: unknown): number | undefined;
export declare function getTranscriptFeatures(feature: Feature): Feature[];
export declare function stripTrailingVersion(s?: string): string | undefined;
export declare function getId(val?: Feature): string;
export declare function getTranscriptDisplayName(val?: Feature): string;
export declare function getGeneDisplayName(val?: Feature): string;
export declare function isRecognizedDatabaseId(id: string): boolean;
export declare function getDbIdLabel(id: string): string;
export declare function buildUniProtXrefQuery(id: string): string | undefined;
export declare function findRecognizedDbIds(f?: Feature): string[];
export interface FeatureIdentifiers {
    recognizedIds: string[];
    uniprotId?: string;
    geneId?: string;
    geneName?: string;
}
/**
 * Extract all useful identifiers from a feature for UniProt lookup.
 * If the feature is a gene, prioritizes identifiers from its first transcript.
 * Otherwise, extracts identifiers from the feature itself.
 * geneId and geneName are always extracted from the parent feature 'f'.
 */
export declare function extractFeatureIdentifiers(f?: Feature): FeatureIdentifiers;
export interface IsoformSequence {
    feature: Feature;
    seq: string;
}
export type IsoformSequences = Record<string, IsoformSequence>;
export interface RankedIsoform {
    feature: Feature;
    length: number;
}
export interface ClassifiedIsoforms {
    matches: RankedIsoform[];
    nonMatches: RankedIsoform[];
    noData: Feature[];
}
export declare function classifyIsoforms({ options, isoformSequences, structureSequence, }: {
    options: Feature[];
    isoformSequences: IsoformSequences;
    structureSequence?: string;
}): ClassifiedIsoforms;
/**
 * Which of a structure's polymer chains the launch dialog should compare
 * transcripts against. A multi-chain deposit (heteromer, protein-DNA complex,
 * processed peptide) has no reason to put the gene's protein first, so prefer
 * whichever chain some isoform translates to exactly; the first chain stays the
 * fallback. This is the dialog-side counterpart of chooseMappedEntity, which
 * the view uses to pick the mapped entity once loaded — without it the picker
 * reported "no isoform matches" for structures the view then mapped fine.
 */
export declare function pickStructureSequence(structureSequences: string[] | undefined, isoformSequences: IsoformSequences | undefined): string | undefined;
export declare function selectBestTranscript(args: {
    options: Feature[];
    isoformSequences: IsoformSequences;
    structureSequence?: string;
}): Feature | undefined;
