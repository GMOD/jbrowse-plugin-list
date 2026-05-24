import { type Instance } from '@jbrowse/mobx-state-tree';
import type { PairwiseAlignment } from '../mappings';
import type { AlignmentAlgorithm } from './types';
import type { SimpleFeatureSerialized } from '@jbrowse/core/util';
import type { Region as IRegion } from '@jbrowse/core/util/types';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
import type { PluginContext } from 'molstar/lib/mol-plugin/context';
type LGV = LinearGenomeViewModel;
type MaybeLGV = LGV | undefined;
type MaybePairwiseAlignment = PairwiseAlignment | undefined;
export interface ParentProteinView {
    zoomToBaseLevel: boolean;
    autoScrollAlignment: boolean;
    showHighlight: boolean;
    showProteinTracks: boolean;
    alignmentAlgorithm: AlignmentAlgorithm;
    molstarPluginContext: PluginContext | undefined;
    structures: {
        url?: string;
    }[];
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
     */
    userProvidedTranscriptSequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
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
     */
    hoverPosition: {
        structureSeqPos?: number;
        code?: string;
        chain?: string;
    } | undefined;
    /**
     * #volatile
     */
    structureSequences: string[] | undefined;
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
} & {
    setSequences(str?: string[]): void;
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
     */
    setAlignment(r?: PairwiseAlignment): void;
    /**
     * #action
     */
    setIsMouseInAlignment(val: boolean): void;
} & {
    /**
     * #getter
     * Extracts UniProt ID from AlphaFold URL if available
     */
    readonly uniprotId: string | undefined;
    /**
     * #getter
     */
    readonly structureTranscriptMaps: {
        structureSeqToTranscriptSeqPosition: Record<number, number>;
        transcriptSeqToStructureSeqPosition: Record<number, number>;
    } | undefined;
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
     */
    readonly pairwiseAlignmentToTranscriptPosition: Record<number, number> | undefined;
    /**
     * #getter
     */
    readonly pairwiseAlignmentToStructurePosition: Record<number, number> | undefined;
    /**
     * #getter
     */
    readonly hoverString: string;
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
    readonly alignmentHoverPos: number | undefined;
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
     * Genome regions to highlight in the LGV based on the current hover.
     * A feature-range hover (hoverStructureRange) takes priority over a
     * single-residue hover (structureSeqHoverPos).
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
     */
    readonly exactMatch: boolean;
    readonly parentView: ParentProteinView;
    readonly zoomToBaseLevel: boolean;
    readonly autoScrollAlignment: boolean;
    readonly showHighlight: boolean;
    readonly showProteinTracks: boolean;
    readonly alignmentAlgorithm: AlignmentAlgorithm;
    readonly molstarPluginContext: PluginContext | undefined;
    /**
     * #getter
     * Returns this structure's index in the parent's structures array
     */
    readonly structureIndex: number;
    /**
     * #getter
     * Returns the Molstar structure object for the current structure.
     * Note: We access loadedToMolstar to ensure MobX recomputes this getter
     * when the structure finishes loading (Molstar's internal state isn't observable).
     */
    readonly molstarStructure: import("molstar/lib/mol-model/structure").Structure | undefined;
} & {
    setError(e: unknown): void;
    /**
     * #action
     */
    hoverAlignmentPosition(alignmentPos: number): void;
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
