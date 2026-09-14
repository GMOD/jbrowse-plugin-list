import type { IsoformSequences } from './util';
import type { Feature } from '@jbrowse/core/util';
export interface RankedIsoform {
    feature: Feature;
    length: number;
    /** identical residues against the structure, for an isoform that does not
     * match it exactly; undefined with no structure to compare to */
    identical?: number;
    /** that alignment's score, which is what ranks non-matching isoforms */
    score?: number;
}
export interface ClassifiedIsoforms {
    matches: RankedIsoform[];
    nonMatches: RankedIsoform[];
    noData: Feature[];
}
/**
 * The single rule for ranking transcript isoforms against a structure, shared
 * by the picker UI and the auto-selection. An isoform whose translation is the
 * structure's sequence wins outright. Among the rest, the best alignment score
 * comes first, then the most identical residues, then length.
 *
 * The score has to lead: an isoform carrying an exon the structure lacks
 * aligns every structure residue too, across a gap, so it ties on identical
 * residues with the isoform the structure was made from (1MH1 against Rac1
 * and Rac1b). See docs/genome-to-structure-alignment.md for the measurement.
 */
export declare function classifyIsoforms({ options, isoformSequences, structureSequence, }: {
    options: Feature[];
    isoformSequences: IsoformSequences;
    structureSequence?: string;
}): ClassifiedIsoforms;
export declare function selectBestTranscript(args: {
    options: Feature[];
    isoformSequences: IsoformSequences;
    structureSequence?: string;
}): Feature | undefined;
/**
 * Which of a structure's protein chains the launch dialog compares isoforms
 * against: one some isoform translates to exactly, else the chain the view's
 * own `chooseMappedEntity` would map the longest isoform to, never simply the
 * first (CDK2, on 1H26). `structureSequences` must hold protein chains only.
 */
export declare function pickStructureSequence(structureSequences: string[] | undefined, isoformSequences: IsoformSequences | undefined): string | undefined;
