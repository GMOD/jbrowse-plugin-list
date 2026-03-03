import { SimpleFeatureSerialized } from '@jbrowse/core/util';
import { Region as IRegion } from '@jbrowse/core/util/types';
import { type Instance } from '@jbrowse/mobx-state-tree';
import { AlignmentAlgorithm } from './types';
import { PairwiseAlignment } from '../mappings';
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
     */
    clickGenomeHighlights: IRegion[];
    /**
     * #volatile
     */
    hoverGenomeHighlights: IRegion[];
    /**
     * #volatile
     */
    clickPosition: {
        structureSeqPos: number;
        code: string;
        chain: string;
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
    pairwiseAlignmentStatus: string;
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
     * Persistent range of alignment positions from click (e.g., when clicking a protein feature)
     */
    clickAlignmentRange: {
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
    setClickedPosition(arg?: {
        structureSeqPos: number;
        code: string;
        chain: string;
    }): void;
    /**
     * #action
     */
    setClickGenomeHighlights(r: IRegion[]): void;
    /**
     * #action
     */
    clearClickGenomeHighlights(): void;
    /**
     * #action
     */
    setHoverGenomeHighlights(r: IRegion[]): void;
    /**
     * #action
     */
    clearHoverGenomeHighlights(): void;
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
    clearAlignmentHoverRange(): void;
    /**
     * #action
     */
    setClickAlignmentRange(range?: {
        start: number;
        end: number;
    }): void;
    /**
     * #action
     */
    clearClickAlignmentRange(): void;
    /**
     * #action
     */
    setSelectedFeatureId(uniqueId?: string): void;
    /**
     * #action
     */
    clearSelectedFeatureId(): void;
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
    setAlignmentStatus(str: string): void;
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
    readonly clickString: string;
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
    /**
     * #action
     * Highlight a residue from an external source (e.g., MSA view)
     */
    highlightFromExternal(structureSeqPos: number): void;
    /**
     * #action
     * Clear highlight from an external source
     */
    clearHighlightFromExternal(): void;
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
