import { type Instance } from '@jbrowse/mobx-state-tree';
import { type CoordinateMapper } from './coordinates';
import type { Entity } from './extractStructureSequences';
import type { EntityConfidence, StructureData } from './loadStructureData';
import type { PairwiseAlignment } from '../mappings';
import type { AlignmentAlgorithm } from './types';
import type { SimpleFeatureSerialized } from '@jbrowse/core/util';
import type { Region as IRegion } from '@jbrowse/core/util/types';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
import type { Structure as MolstarStructure } from 'molstar/lib/mol-model/structure';
import type { PluginContext } from 'molstar/lib/mol-plugin/context';
type LGV = LinearGenomeViewModel;
type MaybeLGV = LGV | undefined;
type MaybePairwiseAlignment = PairwiseAlignment | undefined;
export interface ParentProteinView {
    zoomToBaseLevel: boolean;
    autoScrollAlignment: boolean;
    showHighlight: boolean;
    showProteinTracks: boolean;
    compactTracks: boolean;
    alignmentAlgorithm: AlignmentAlgorithm;
    molstarPluginContext: PluginContext | undefined;
    setShowAlignment: (f: boolean) => void;
    setError: (e: unknown) => void;
}
declare const Structure: import("@jbrowse/mobx-state-tree").IModelType<{
    /**
     * #property
     */
    url: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    /**
     * #property
     */
    data: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    /**
     * #property
     */
    connectedViewId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    /**
     * #property
     */
    pairwiseAlignment: import("@jbrowse/mobx-state-tree").IType<MaybePairwiseAlignment, MaybePairwiseAlignment, MaybePairwiseAlignment>;
    /**
     * #property
     */
    feature: import("@jbrowse/mobx-state-tree").IType<SimpleFeatureSerialized | undefined, SimpleFeatureSerialized | undefined, SimpleFeatureSerialized | undefined>;
    /**
     * #property
     * Optional so a hand-authored `structures: [{ url }]` snapshot hydrates
     * without this field; empty means "use the structure's own sequence".
     */
    userProvidedTranscriptSequence: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    /**
     * #property
     * Declarative seed for the persistent domain selection: a 0-based,
     * half-open structure-residue range `{ start, end }` lit on load exactly as
     * if the user had clicked that domain — magenta in the 3D structure, a band
     * on the connected genome view, and the range in the alignment. Lets a
     * session spec open with a domain pre-highlighted, with no click.
     */
    initialSelection: import("@jbrowse/mobx-state-tree").IType<{
        start: number;
        end: number;
    } | undefined, {
        start: number;
        end: number;
    } | undefined, {
        start: number;
        end: number;
    } | undefined>;
    /**
     * #property
     * The same seed named by author residue numbers, inclusive, as a paper
     * cites a site: `{ start: 248, end: 248 }` for p53's R248 whichever
     * fragment the crystal holds. Resolved to positions through the mapped
     * entity's numbering once the structure loads, so it needs no knowledge of
     * where the construct starts.
     */
    initialResidues: import("@jbrowse/mobx-state-tree").IType<{
        start: number;
        end: number;
    } | undefined, {
        start: number;
        end: number;
    } | undefined, {
        start: number;
        end: number;
    } | undefined>;
    /**
     * #property
     * mmCIF entity the transcript maps to. Chosen by alignment when the
     * structure loads (see chooseMappedEntity), or by the user through the
     * chain picker. Persisted beside `pairwiseAlignment` because that
     * alignment is against this entity's sequence: restoring one without the
     * other would light chain A's residues with chain C's alignment.
     */
    mappedEntityId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
}, {
    /**
     * #volatile
     * Inclusive-exclusive structure-residue range from a click; drives the
     * derived clickGenomeHighlights getter.
     */
    clickedStructureRange: {
        start: number;
        end: number;
    } | undefined;
    /**
     * #volatile
     * The 'genome' source is set when the hover originated from the
     * connected LinearGenomeView; hoverGenomeHighlights ignores it to avoid
     * echoing a codon-width highlight back onto the same genome view.
     */
    hoverPosition: {
        structureSeqPos?: number;
        code?: string;
        chain?: string;
        source: "structure" | "genome";
    } | undefined;
    /**
     * #volatile
     */
    entities: Entity[] | undefined;
    /**
     * #volatile
     * Per-entity B-factor / pLDDT keyed by label_seq_id. Drives the
     * confidence feature track.
     */
    structureConfidence: EntityConfidence[] | undefined;
    /**
     * #volatile
     */
    isMouseInAlignment: boolean;
    /**
     * #volatile
     * Tracks whether this structure has been loaded into Molstar
     */
    loadedToMolstar: boolean;
    /**
     * #volatile
     * The molstar Structure this model's load produced, captured from the
     * loader rather than looked up by position in
     * `hierarchy.current.structures` — that array is ordered by load
     * completion, so with two structures in flight index N can be another
     * model's geometry.
     */
    molstarStructure: MolstarStructure | undefined;
    /**
     * #volatile
     * Range of alignment positions to highlight (e.g., when hovering a protein feature)
     */
    alignmentHoverRange: {
        start: number;
        end: number;
    } | undefined;
    /**
     * #volatile
     * The uniqueId of the currently selected protein feature (for persistent highlight)
     */
    selectedFeatureId: string | undefined;
    /**
     * #volatile
     * Set of feature track types that are hidden
     */
    hiddenFeatureTypes: Set<string>;
    /**
     * #volatile
     * Set of feature track types expanded to show every overlapping feature on
     * its own lane (collapsed types draw all features on a single row)
     */
    expandedFeatureTypes: Set<string>;
} & {
    setStructureData(data: StructureData): void;
    /**
     * #action
     */
    hideFeatureType(type: string): void;
    /**
     * #action
     */
    showFeatureType(type: string): void;
    /**
     * #action
     */
    showAllFeatureTypes(): void;
    /**
     * #action
     */
    toggleFeatureTypeExpanded(type: string): void;
    /**
     * #action
     */
    setLoadedToMolstar(val: boolean): void;
} & {
    /**
     * #getter
     */
    readonly connectedView: MaybeLGV;
} & {
    /**
     * #action
     */
    setClickedStructureRange(range?: {
        start: number;
        end: number;
    }): void;
    /**
     * #action
     */
    setAlignmentHoverRange(range?: {
        start: number;
        end: number;
    }): void;
    /**
     * #action
     */
    setSelectedFeatureId(uniqueId?: string): void;
    /**
     * #action
     */
    setHoveredPosition(arg?: {
        structureSeqPos?: number;
        chain?: string;
        code?: string;
    }): void;
    /**
     * #action
     * Records a hover that originated from the connected LinearGenomeView.
     * Drives the 3D structure / feature-track highlight, but is excluded
     * from hoverGenomeHighlights so it doesn't echo back onto that same view.
     */
    setGenomeHoveredPosition(structureSeqPos?: number): void;
    /**
     * #action
     */
    setAlignment(r?: PairwiseAlignment): void;
    /**
     * #action
     */
    setMappedEntityId(id?: string): void;
    /**
     * #action
     */
    setIsMouseInAlignment(val: boolean): void;
} & {
    /**
     * #getter
     * Sequence strings of every polymer entity (back-compat for the alignment
     * autorun and presence checks).
     */
    readonly structureSequences: string[] | undefined;
    /**
     * #getter
     * The entity that maps to the transcript: the chosen one when
     * `mappedEntityId` is set, else the first, so a standalone structure with
     * no transcript still has a chain to read hovers from.
     */
    readonly mappedEntity: Entity | undefined;
    /**
     * #getter
     */
    readonly mappedStructureSeq: string | undefined;
    /**
     * #getter
     * The structure's name in the UI: PDB id, AlphaFold accession, else file
     * name. Heads its alignment panel and prefixes its hover readout, so with
     * several structures open a reader can tell which panel and which residue
     * belongs to which structure.
     */
    readonly label: string;
    /**
     * #getter
     * Extracts UniProt ID from AlphaFold URL if available
     */
    readonly uniprotId: string | undefined;
    /**
     * #getter
     * All structure/transcript/alignment coordinate conversions, built once
     * from the pairwise alignment (see coordinates.ts). Use its typed methods
     * for point conversions; the getters below expose the raw maps for
     * whole-map consumers.
     */
    readonly coordinateMapper: CoordinateMapper | undefined;
    /**
     * #getter
     */
    readonly structureSeqToTranscriptSeqPosition: Record<number, number> | undefined;
    /**
     * #getter
     */
    readonly transcriptSeqToStructureSeqPosition: Record<number, number> | undefined;
    /**
     * #getter
     */
    readonly structurePositionToAlignmentMap: Record<number, number> | undefined;
    /**
     * #getter
     */
    readonly transcriptPositionToAlignmentMap: Record<number, number> | undefined;
    /**
     * #getter
     * Per-residue pLDDT of the mapped entity, mapped to alignment columns and
     * shown only when the B-factor column actually looks like AlphaFold
     * confidence. Values are looked up by label_seq_id through the entity's own
     * seqIds, so an unobserved residue leaves a gap instead of shifting the
     * rest of the track.
     */
    readonly confidenceCells: {
        col: number;
        value: number;
    }[];
    /**
     * #getter
     * Per-residue Kyte-Doolittle hydrophobicity mapped to alignment columns.
     */
    readonly hydrophobicityCells: {
        col: number;
        value: number;
    }[];
    /**
     * #getter
     */
    readonly pairwiseAlignmentToTranscriptPosition: Record<number, number> | undefined;
    /**
     * #getter
     */
    readonly pairwiseAlignmentToStructurePosition: Record<number, number> | undefined;
    /**
     * #method
     * What the mapped entity's residue at a 0-based position is called: its
     * author number where the file has one (R248 of p53 in 1TUP, where the
     * position is 154), so the ruler and hover read like the literature.
     */
    residueNumber(pos: number): number;
    /**
     * #getter
     * The hovered residue, read out for the header: its author number first,
     * then the transcript residue it aligns to when that differs (a crystal
     * whose construct was renumbered from one), letters, chain and codon locus.
     */
    readonly hoverString: string;
    /**
     * #getter
     * The hovered residue's codon as a 1-based locString, so the header can
     * name where in the genome a residue sits without a click.
     */
    readonly hoverGenomeLocus: string | undefined;
    /**
     * #getter
     */
    readonly genomeToTranscriptSeqMapping: {
        g2p: Record<number, number>;
        p2g: Record<number, number>;
        p2gCodon: Record<number, number[]>;
        refName: string;
        strand: number;
    } | undefined;
    /**
     * #getter
     */
    readonly structureSeqHoverPos: number | undefined;
    /**
     * #getter
     */
    readonly alignmentHoverPos: import("./coordinates").AlignmentCol | undefined;
    /**
     * #getter
     * Structure-residue range from a feature-bar hover, derived by mapping
     * alignmentHoverRange through pairwiseAlignmentToStructurePosition.
     * End is exclusive, matching clickedStructureRange.
     */
    readonly hoverStructureRange: {
        start: number;
        end: number;
    } | undefined;
    /**
     * #getter
     * The current hover as a 0-based half-open structure range. A feature-range
     * hover (hoverStructureRange) takes priority over a single-residue hover
     * (structureSeqHoverPos). Drives both the molstar 3D highlight and the
     * genome highlight.
     */
    readonly hoverHighlightRange: {
        start: number;
        end: number;
    } | undefined;
    /**
     * #getter
     * molstar's label_seq_id -> 0-based structure position for the mapped
     * entity. Computed once per entity rather than per hover event.
     */
    readonly labelSeqIdIndex: Map<number, number>;
    /**
     * #getter
     * The residues the molstar 'select' channel should light, as label_seq_ids:
     * a clicked/declarative domain range takes priority, else the whole
     * alignment-covered set when showHighlight is on, else nothing.
     */
    readonly selectLabelSeqIds: number[];
    /**
     * #getter
     * The residues the molstar 'highlight' (hover) channel should light.
     */
    readonly hoverLabelSeqIds: number[];
    /**
     * #getter
     * Persistent click selection in alignment coordinates, derived from
     * clickedStructureRange via structurePositionToAlignmentMap.
     */
    readonly clickAlignmentRange: {
        start: number;
        end: number;
    } | undefined;
    /**
     * #getter
     * Maps a structure-residue range to genome coordinates as a single
     * IRegion. Handles single-residue and multi-residue ranges.
     */
    structureRangeToGenomeHighlight(range: {
        start: number;
        end: number;
    } | undefined): IRegion[];
    /**
     * #getter
     * Genome regions to highlight in the LGV from the current hover. Excludes
     * hovers that originated from the genome view itself, so hovering the LGV
     * doesn't echo a codon-width highlight back onto that same view.
     */
    readonly hoverGenomeHighlights: IRegion[];
    /**
     * #getter
     * Genome regions to highlight in the LGV from the persistent click
     * selection. Derived from clickedStructureRange.
     */
    readonly clickGenomeHighlights: IRegion[];
    /**
     * #getter
     * Returns the single-letter amino acid code from the structure at hover position
     */
    readonly hoverStructureLetter: string | undefined;
    /**
     * #getter
     * Returns the single-letter amino acid code from the genome/transcript at hover position
     */
    readonly hoverGenomeLetter: string | undefined;
    /**
     * #getter
     */
    readonly alignmentMatchSet: Set<number> | undefined;
    /**
     * #getter
     * True while a pairwise alignment can still be produced but hasn't been
     * computed yet (both the transcript and structure sequences are present).
     * A standalone structure with no connected transcript has no sequence to
     * align against, so this stays false — the header shows no loader rather
     * than a perpetual "Loading pairwise alignment".
     */
    readonly alignmentPending: boolean;
    /**
     * #getter
     */
    readonly exactMatch: boolean;
    readonly parentView: ParentProteinView;
    readonly zoomToBaseLevel: boolean;
    readonly autoScrollAlignment: boolean;
    readonly showHighlight: boolean;
    readonly showProteinTracks: boolean;
    readonly trackHeight: number;
    readonly trackGap: number;
    readonly alignmentAlgorithm: AlignmentAlgorithm;
    readonly molstarPluginContext: PluginContext | undefined;
} & {
    setError(e: unknown): void;
    /**
     * #action
     */
    hoverAlignmentPosition(alignmentPos: number): void;
    /**
     * #action
     * The user's override of which chain the transcript maps to. The alignment
     * is recomputed against that entity's sequence, and every highlight that
     * derived from the old one is dropped, since its positions meant residues
     * of another chain.
     */
    chooseEntity(entityId: string): void;
    /**
     * #action
     */
    clickAlignmentPosition(alignmentPos: number): void;
} & {
    afterAttach(): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
export default Structure;
export type JBrowsePluginProteinStructureStateModel = typeof Structure;
export type JBrowsePluginProteinStructureModel = Instance<JBrowsePluginProteinStructureStateModel>;
