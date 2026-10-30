import type { JBrowsePluginMsaViewModel } from './model';
import type { TranscriptMap } from './transcriptMap';
/** The `transientHighlights` owner the session's highlights draw under */
export declare const SESSION_HIGHLIGHT_OWNER = "session-highlights";
/** A session highlight: a genome region, 0-based half-open */
export interface GenomeHighlight {
    assemblyName: string;
    refName: string;
    start: number;
    end: number;
    label?: string;
    color?: string;
}
/** react-msaview's residue-span highlight: residues of `row`, 1-based */
export interface RowHighlight {
    row: string;
    start: number;
    end: number;
    label?: string;
    color?: string;
}
/**
 * Where the query row sits on the genome: through a transcript, each coding
 * base mapping to its residue, or as the bases of a MAF block
 */
export type QueryOnGenome = {
    kind: 'transcript';
    map: Pick<TranscriptMap, 'g2p' | 'refName'>;
} | {
    kind: 'maf';
    refName: string;
    start: number;
    end: number;
};
/**
 * The session's highlights on the query row, one residue span per run of
 * consecutive residues a highlight covers, each keeping the highlight's label
 * and color. A highlight on another assembly or chromosome, or off the
 * transcript, draws nothing here.
 */
export declare function sessionHighlightsOnQueryRow({ highlights, onGenome, querySeqName, querySeqOffset, sameAssembly, sameRefName, labels, }: {
    highlights: readonly GenomeHighlight[];
    onGenome: QueryOnGenome;
    querySeqName: string;
    querySeqOffset: number;
    sameAssembly: (assemblyName: string) => boolean;
    sameRefName: (refName: string) => boolean;
    /** whether the session writes labels on its highlights */
    labels: boolean;
}): RowHighlight[];
/**
 * Draw the session's highlights on the query row as react-msaview transient
 * highlights, so a codon highlighted on the genome lights and labels its
 * alignment column. They are derived, so the alignment's own snapshot never
 * holds them.
 */
export declare function syncSessionHighlights(self: JBrowsePluginMsaViewModel): () => void;
