import Structure from './structureModel';
import { AlignmentAlgorithm } from './types';
import type { Instance } from '@jbrowse/mobx-state-tree';
import type { PluginContext } from 'molstar/lib/mol-plugin/context';
export interface ProteinViewInitState {
    structures?: {
        url?: string;
        data?: string;
    }[];
    showControls?: boolean;
    showAlignment?: boolean;
}
/**
 * #stateModel Protein3dViewPlugin
 * extends
 * - BaseViewModel
 */
declare function stateModelFactory(): import("@jbrowse/mobx-state-tree").IModelType<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    minimized: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
} & {
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"ProteinView">;
    structures: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
        url: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        data: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        connectedViewId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        pairwiseAlignment: import("@jbrowse/mobx-state-tree").IType<import("../mappings").PairwiseAlignment | undefined, import("../mappings").PairwiseAlignment | undefined, import("../mappings").PairwiseAlignment | undefined>;
        feature: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/core/util").SimpleFeatureSerialized | undefined, import("@jbrowse/core/util").SimpleFeatureSerialized | undefined, import("@jbrowse/core/util").SimpleFeatureSerialized | undefined>;
        userProvidedTranscriptSequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {
        clickGenomeHighlights: import("@jbrowse/core/util").Region[];
        hoverGenomeHighlights: import("@jbrowse/core/util").Region[];
        clickPosition: {
            structureSeqPos: number;
            code: string;
            chain: string;
        } | undefined;
        hoverPosition: {
            structureSeqPos?: number;
            code?: string;
            chain? /**
             * #action
             */: string;
        } | undefined;
        pairwiseAlignmentStatus: string;
        structureSequences: string[] | undefined;
        isMouseInAlignment: boolean;
        loadedToMolstar: boolean;
        alignmentHoverRange: {
            start: number;
            end: number;
        } | undefined;
        clickAlignmentRange: {
            start: number;
            end: number;
        } | undefined;
        selectedFeatureId: string | undefined;
        hiddenFeatureTypes: Set<string>;
    } & {
        setSequences(str?: string[]): void;
        hideFeatureType(type: string): void;
        showFeatureType(type: string): void;
        showAllFeatureTypes(): void;
        setLoadedToMolstar(val: boolean): void;
    } & {
        readonly connectedView: ({
            id: string;
            displayName: string | undefined;
            minimized: boolean;
            type: string;
            offsetPx: number;
            bpPerPx: number;
            displayedRegions: import("@jbrowse/core/util").Region[] & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/core/util").Region[], import("@jbrowse/core/util").Region[], import("@jbrowse/core/util").Region[]>, [undefined]>>;
            tracks: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IAnyType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IAnyType>>;
            hideHeader: boolean;
            hideHeaderOverview: boolean;
            hideNoTracksActive: boolean;
            trackSelectorType: string;
            showCenterLine: boolean;
            showCytobandsSetting: boolean;
            trackLabels: string;
            showGridlines: boolean;
            highlight: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view").HighlightType, import("@jbrowse/plugin-linear-genome-view").HighlightType, import("@jbrowse/plugin-linear-genome-view").HighlightType>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view").HighlightType, import("@jbrowse/plugin-linear-genome-view").HighlightType, import("@jbrowse/plugin-linear-genome-view").HighlightType>>, [undefined]>>;
            colorByCDS: boolean;
            showTrackOutlines: boolean;
            init: (import("@jbrowse/plugin-linear-genome-view").InitState & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined>>) | undefined;
        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
            width: number;
        } & {
            menuItems(): import("@jbrowse/core/ui").MenuItem[];
        } & {
            setDisplayName(name: string): void;
            setWidth(newWidth: number): void;
            setMinimized(flag: boolean): void;
        } & {
            volatileWidth: number | undefined;
            minimumBlockWidth: number;
            draggingTrackId: undefined | string;
            lastTrackDragY: undefined | number;
            volatileError: unknown;
            scaleFactor: number;
            targetBpPerPx: number | undefined;
            trackRefs: Record<string, HTMLDivElement>;
            coarseDynamicBlocks: import("@jbrowse/core/util/blockTypes").BaseBlock[];
            coarseTotalBp: number;
            leftOffset: undefined | import("@jbrowse/plugin-linear-genome-view").BpOffset;
            rightOffset: undefined | import("@jbrowse/plugin-linear-genome-view").BpOffset;
            isScalebarRefNameMenuOpen: boolean;
            scalebarRefNameClickPending: boolean;
            volatileGuides: import("@jbrowse/plugin-linear-genome-view").VolatileGuide[];
        } & {
            readonly pinnedTracks: any[];
            readonly unpinnedTracks: any[];
            readonly trackLabelsSetting: any;
            readonly width: number;
            readonly interRegionPaddingWidth: number;
            readonly assemblyNames: string[];
            readonly assemblyDisplayNames: string[];
            readonly isTopLevelView: boolean;
            readonly stickyViewHeaders: boolean;
            readonly rubberbandTop: number;
            readonly pinnedTracksTop: number;
        } & {
            scalebarDisplayPrefix(): string | undefined;
            MiniControlsComponent(): React.FC<any>;
            HeaderComponent(): React.FC<any>;
            readonly assembliesNotFound: string | undefined;
            readonly assemblyErrors: string;
            readonly assembliesInitialized: boolean;
            readonly initialized: boolean;
            readonly hasDisplayedRegions: boolean;
            readonly loadingMessage: "Loading" | undefined;
            readonly hasSomethingToShow: boolean;
            readonly showLoading: boolean;
            readonly showImportForm: boolean;
            readonly scalebarHeight: number;
            readonly headerHeight: number;
            readonly trackHeights: number;
            readonly trackHeightsWithResizeHandles: number;
            readonly height: number;
            readonly totalBp: number;
            getNonElidedRegionCount(bpPerPx: number): number;
            getInterRegionPaddingPx(bpPerPx: number): number;
            readonly maxBpPerPx: number;
            readonly minBpPerPx: number;
            readonly error: unknown;
            readonly maxOffset: number;
            readonly minOffset: number;
            readonly displayedRegionsTotalPx: number;
            renderProps(): any;
            searchScope(assemblyName: string): {
                assemblyName: string;
                includeAggregateIndexes: boolean;
                tracks: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IAnyType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IAnyType>>;
            };
            readonly trackMap: Map<any, any>;
            getTrack(id: string): any;
            rankSearchResults(results: import("@jbrowse/core/TextSearch/BaseResults").default[]): import("@jbrowse/core/TextSearch/BaseResults").default[];
            readonly trackTypeActions: Map<string, import("@jbrowse/core/ui").MenuItem[]>;
        } & {
            setShowTrackOutlines(arg: boolean): void;
            setColorByCDS(flag: boolean): void;
            setShowCytobands(flag: boolean): void;
            setWidth(newWidth: number): void;
            setError(error: unknown): void;
            setIsScalebarRefNameMenuOpen(isOpen: boolean): void;
            setScalebarRefNameClickPending(pending: boolean): void;
            setHideHeader(b: boolean): void;
            setHideHeaderOverview(b: boolean): void;
            setHideNoTracksActive(b: boolean): void;
            setShowGridlines(b: boolean): void;
            addToHighlights(highlight: import("@jbrowse/plugin-linear-genome-view").HighlightType): void;
            setHighlight(highlight?: import("@jbrowse/plugin-linear-genome-view").HighlightType[]): void;
            removeHighlight(highlight: import("@jbrowse/plugin-linear-genome-view").HighlightType): void;
            setVolatileGuides(guides: import("@jbrowse/plugin-linear-genome-view").VolatileGuide[]): void;
            scrollTo(offsetPx: number): number;
            zoomTo(bpPerPx: number, offset?: number, centerAtOffset?: boolean): number;
            setOffsets(left?: import("@jbrowse/plugin-linear-genome-view").BpOffset, right?: import("@jbrowse/plugin-linear-genome-view").BpOffset): void;
            setSearchResults(searchResults: import("@jbrowse/core/TextSearch/BaseResults").default[], searchQuery: string, assemblyName?: string): void;
            setNewView(bpPerPx: number, offsetPx: number): void;
            horizontallyFlip(): void;
            showTrack(trackId: string, initialSnapshot?: {}, displayInitialSnapshot?: {}): any;
            hideTrack(trackId: string): 0 | 1;
        } & {
            moveTrackDown(id: string): void;
            moveTrackUp(id: string): void;
            moveTrackToTop(id: string): void;
            moveTrackToBottom(id: string): void;
            moveTrack(movingId: string, targetId: string): void;
            toggleTrack(trackId: string): void;
            setTrackLabels(setting: "overlapping" | "offset" | "hidden"): void;
            setShowCenterLine(b: boolean): void;
            setDisplayedRegions(regions: import("@jbrowse/core/util").Region[]): void;
            activateTrackSelector(): import("@jbrowse/core/util").Widget;
            getSelectedRegions(leftOffset?: import("@jbrowse/plugin-linear-genome-view").BpOffset, rightOffset?: import("@jbrowse/plugin-linear-genome-view").BpOffset): {
                assemblyName: string;
                refName: string;
                start: number;
                end: number;
            }[];
            horizontalScroll(distance: number): number;
            showAllRegions(): void;
            showAllRegionsInAssembly(assemblyName?: string): void;
            setDraggingTrackId(idx?: string): void;
            setLastTrackDragY(y: number): void;
            setScaleFactor(factor: number): void;
            setTargetBpPerPx(target: number | undefined): void;
            clearView(): void;
            setInit(arg?: import("@jbrowse/plugin-linear-genome-view").InitState): void;
            exportSvg(opts?: import("@jbrowse/plugin-linear-genome-view").ExportSvgOptions): Promise<void>;
        } & {
            slide: (viewWidths: number) => void;
        } & {
            zoom: (targetBpPerPx: number) => void;
        } & {
            readonly canShowCytobands: boolean;
            readonly showCytobands: boolean;
            readonly anyCytobandsExist: boolean;
            readonly cytobandOffset: number;
        } & {
            menuItems(): import("@jbrowse/core/ui").MenuItem[];
        } & {
            readonly staticBlocks: import("@jbrowse/core/util/blockTypes").BlockSet;
            readonly dynamicBlocks: import("@jbrowse/core/util/blockTypes").BlockSet;
            readonly roundedDynamicBlocks: import("@jbrowse/core/util/blockTypes").BaseBlock[];
            readonly visibleLocStrings: string;
            readonly coarseVisibleLocStrings: string;
            readonly coarseTotalBpDisplayStr: string;
            readonly effectiveBpPerPx: number;
            readonly effectiveTotalBp: number;
            readonly effectiveTotalBpDisplayStr: string;
        } & {
            setCoarseDynamicBlocks(blocks: import("@jbrowse/core/util/blockTypes").BlockSet): void;
        } & {
            moveTo(start?: import("@jbrowse/plugin-linear-genome-view").BpOffset, end?: import("@jbrowse/plugin-linear-genome-view").BpOffset): void;
            navToLocString(input: string, optAssemblyName?: string, grow?: number): Promise<void>;
            navToSearchString({ input, assembly, }: {
                input: string;
                assembly: import("@jbrowse/core/assemblyManager/assembly").Assembly;
            }): Promise<void>;
            navToLocation(parsedLocString: import("@jbrowse/core/util").ParsedLocString, assemblyName?: string, grow?: number): Promise<void>;
            navToLocations(regions: import("@jbrowse/core/util").ParsedLocString[], assemblyName?: string, grow?: number): Promise<void>;
            navTo(query: import("@jbrowse/plugin-linear-genome-view").NavLocation, grow?: number): void;
            navToMultiple(locations: import("@jbrowse/plugin-linear-genome-view").NavLocation[], grow?: number): void;
        } & {
            rubberBandMenuItems(): import("@jbrowse/core/ui").MenuItem[];
            bpToPx({ refName, coord, regionNumber, }: {
                refName: string;
                coord: number;
                regionNumber?: number;
            }): {
                index: number;
                offsetPx: number;
            } | undefined;
            centerAt(coord: number, refName: string, regionNumber?: number): void;
            pxToBp(px: number): {
                coord: number;
                index: number;
                refName: string;
                oob: boolean;
                assemblyName: string;
                offset: number;
                start: number;
                end: number;
                reversed?: boolean;
            };
            readonly centerLineInfo: {
                coord: number;
                index: number;
                refName: string;
                oob: boolean;
                assemblyName: string;
                offset: number;
                start: number;
                end: number;
                reversed?: boolean;
            } | undefined;
            readonly visibleRegions: import("@jbrowse/core/util/blockTypes").BaseBlock[];
        } & {
            rubberbandClickMenuItems(clickOffset: import("@jbrowse/plugin-linear-genome-view").BpOffset): import("@jbrowse/core/ui").MenuItem[];
        } & {
            afterCreate(): void;
            afterAttach(): void;
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
            minimized: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        } & {
            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
            offsetPx: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
            bpPerPx: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
            displayedRegions: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/core/util").Region[], import("@jbrowse/core/util").Region[], import("@jbrowse/core/util").Region[]>, [undefined]>;
            tracks: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IAnyType>;
            hideHeader: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            hideHeaderOverview: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            hideNoTracksActive: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            trackSelectorType: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            showCenterLine: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            showCytobandsSetting: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            trackLabels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            showGridlines: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            highlight: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view").HighlightType, import("@jbrowse/plugin-linear-genome-view").HighlightType, import("@jbrowse/plugin-linear-genome-view").HighlightType>>, [undefined]>;
            colorByCDS: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            showTrackOutlines: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            init: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined>;
        }, {
            width: number;
        } & {
            menuItems(): import("@jbrowse/core/ui").MenuItem[];
        } & {
            setDisplayName(name: string): void;
            setWidth(newWidth: number): void;
            setMinimized(flag: boolean): void;
        } & {
            volatileWidth: number | undefined;
            minimumBlockWidth: number;
            draggingTrackId: undefined | string;
            lastTrackDragY: undefined | number;
            volatileError: unknown;
            scaleFactor: number;
            targetBpPerPx: number | undefined;
            trackRefs: Record<string, HTMLDivElement>;
            coarseDynamicBlocks: import("@jbrowse/core/util/blockTypes").BaseBlock[];
            coarseTotalBp: number;
            leftOffset: undefined | import("@jbrowse/plugin-linear-genome-view").BpOffset;
            rightOffset: undefined | import("@jbrowse/plugin-linear-genome-view").BpOffset;
            isScalebarRefNameMenuOpen: boolean;
            scalebarRefNameClickPending: boolean;
            volatileGuides: import("@jbrowse/plugin-linear-genome-view").VolatileGuide[];
        } & {
            readonly pinnedTracks: any[];
            readonly unpinnedTracks: any[];
            readonly trackLabelsSetting: any;
            readonly width: number;
            readonly interRegionPaddingWidth: number;
            readonly assemblyNames: string[];
            readonly assemblyDisplayNames: string[];
            readonly isTopLevelView: boolean;
            readonly stickyViewHeaders: boolean;
            readonly rubberbandTop: number;
            readonly pinnedTracksTop: number;
        } & {
            scalebarDisplayPrefix(): string | undefined;
            MiniControlsComponent(): React.FC<any>;
            HeaderComponent(): React.FC<any>;
            readonly assembliesNotFound: string | undefined;
            readonly assemblyErrors: string;
            readonly assembliesInitialized: boolean;
            readonly initialized: boolean;
            readonly hasDisplayedRegions: boolean;
            readonly loadingMessage: "Loading" | undefined;
            readonly hasSomethingToShow: boolean;
            readonly showLoading: boolean;
            readonly showImportForm: boolean;
            readonly scalebarHeight: number;
            readonly headerHeight: number;
            readonly trackHeights: number;
            readonly trackHeightsWithResizeHandles: number;
            readonly height: number;
            readonly totalBp: number;
            getNonElidedRegionCount(bpPerPx: number): number;
            getInterRegionPaddingPx(bpPerPx: number): number;
            readonly maxBpPerPx: number;
            readonly minBpPerPx: number;
            readonly error: unknown;
            readonly maxOffset: number;
            readonly minOffset: number;
            readonly displayedRegionsTotalPx: number;
            renderProps(): any;
            searchScope(assemblyName: string): {
                assemblyName: string;
                includeAggregateIndexes: boolean;
                tracks: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IAnyType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IAnyType>>;
            };
            readonly trackMap: Map<any, any>;
            getTrack(id: string): any;
            rankSearchResults(results: import("@jbrowse/core/TextSearch/BaseResults").default[]): import("@jbrowse/core/TextSearch/BaseResults").default[];
            readonly trackTypeActions: Map<string, import("@jbrowse/core/ui").MenuItem[]>;
        } & {
            setShowTrackOutlines(arg: boolean): void;
            setColorByCDS(flag: boolean): void;
            setShowCytobands(flag: boolean): void;
            setWidth(newWidth: number): void;
            setError(error: unknown): void;
            setIsScalebarRefNameMenuOpen(isOpen: boolean): void;
            setScalebarRefNameClickPending(pending: boolean): void;
            setHideHeader(b: boolean): void;
            setHideHeaderOverview(b: boolean): void;
            setHideNoTracksActive(b: boolean): void;
            setShowGridlines(b: boolean): void;
            addToHighlights(highlight: import("@jbrowse/plugin-linear-genome-view").HighlightType): void;
            setHighlight(highlight?: import("@jbrowse/plugin-linear-genome-view").HighlightType[]): void;
            removeHighlight(highlight: import("@jbrowse/plugin-linear-genome-view").HighlightType): void;
            setVolatileGuides(guides: import("@jbrowse/plugin-linear-genome-view").VolatileGuide[]): void;
            scrollTo(offsetPx: number): number;
            zoomTo(bpPerPx: number, offset?: number, centerAtOffset?: boolean): number;
            setOffsets(left?: import("@jbrowse/plugin-linear-genome-view").BpOffset, right?: import("@jbrowse/plugin-linear-genome-view").BpOffset): void;
            setSearchResults(searchResults: import("@jbrowse/core/TextSearch/BaseResults").default[], searchQuery: string, assemblyName?: string): void;
            setNewView(bpPerPx: number, offsetPx: number): void;
            horizontallyFlip(): void;
            showTrack(trackId: string, initialSnapshot?: {}, displayInitialSnapshot?: {}): any;
            hideTrack(trackId: string): 0 | 1;
        } & {
            moveTrackDown(id: string): void;
            moveTrackUp(id: string): void;
            moveTrackToTop(id: string): void;
            moveTrackToBottom(id: string): void;
            moveTrack(movingId: string, targetId: string): void;
            toggleTrack(trackId: string): void;
            setTrackLabels(setting: "overlapping" | "offset" | "hidden"): void;
            setShowCenterLine(b: boolean): void;
            setDisplayedRegions(regions: import("@jbrowse/core/util").Region[]): void;
            activateTrackSelector(): import("@jbrowse/core/util").Widget;
            getSelectedRegions(leftOffset?: import("@jbrowse/plugin-linear-genome-view").BpOffset, rightOffset?: import("@jbrowse/plugin-linear-genome-view").BpOffset): {
                assemblyName: string;
                refName: string;
                start: number;
                end: number;
            }[];
            horizontalScroll(distance: number): number;
            showAllRegions(): void;
            showAllRegionsInAssembly(assemblyName?: string): void;
            setDraggingTrackId(idx?: string): void;
            setLastTrackDragY(y: number): void;
            setScaleFactor(factor: number): void;
            setTargetBpPerPx(target: number | undefined): void;
            clearView(): void;
            setInit(arg?: import("@jbrowse/plugin-linear-genome-view").InitState): void;
            exportSvg(opts?: import("@jbrowse/plugin-linear-genome-view").ExportSvgOptions): Promise<void>;
        } & {
            slide: (viewWidths: number) => void;
        } & {
            zoom: (targetBpPerPx: number) => void;
        } & {
            readonly canShowCytobands: boolean;
            readonly showCytobands: boolean;
            readonly anyCytobandsExist: boolean;
            readonly cytobandOffset: number;
        } & {
            menuItems(): import("@jbrowse/core/ui").MenuItem[];
        } & {
            readonly staticBlocks: import("@jbrowse/core/util/blockTypes").BlockSet;
            readonly dynamicBlocks: import("@jbrowse/core/util/blockTypes").BlockSet;
            readonly roundedDynamicBlocks: import("@jbrowse/core/util/blockTypes").BaseBlock[];
            readonly visibleLocStrings: string;
            readonly coarseVisibleLocStrings: string;
            readonly coarseTotalBpDisplayStr: string;
            readonly effectiveBpPerPx: number;
            readonly effectiveTotalBp: number;
            readonly effectiveTotalBpDisplayStr: string;
        } & {
            setCoarseDynamicBlocks(blocks: import("@jbrowse/core/util/blockTypes").BlockSet): void;
        } & {
            moveTo(start?: import("@jbrowse/plugin-linear-genome-view").BpOffset, end?: import("@jbrowse/plugin-linear-genome-view").BpOffset): void;
            navToLocString(input: string, optAssemblyName?: string, grow?: number): Promise<void>;
            navToSearchString({ input, assembly, }: {
                input: string;
                assembly: import("@jbrowse/core/assemblyManager/assembly").Assembly;
            }): Promise<void>;
            navToLocation(parsedLocString: import("@jbrowse/core/util").ParsedLocString, assemblyName?: string, grow?: number): Promise<void>;
            navToLocations(regions: import("@jbrowse/core/util").ParsedLocString[], assemblyName?: string, grow?: number): Promise<void>;
            navTo(query: import("@jbrowse/plugin-linear-genome-view").NavLocation, grow?: number): void;
            navToMultiple(locations: import("@jbrowse/plugin-linear-genome-view").NavLocation[], grow?: number): void;
        } & {
            rubberBandMenuItems(): import("@jbrowse/core/ui").MenuItem[];
            bpToPx({ refName, coord, regionNumber, }: {
                refName: string;
                coord: number;
                regionNumber?: number;
            }): {
                index: number;
                offsetPx: number;
            } | undefined;
            centerAt(coord: number, refName: string, regionNumber?: number): void;
            pxToBp(px: number): {
                coord: number;
                index: number;
                refName: string;
                oob: boolean;
                assemblyName: string;
                offset: number;
                start: number;
                end: number;
                reversed?: boolean;
            };
            readonly centerLineInfo: {
                coord: number;
                index: number;
                refName: string;
                oob: boolean;
                assemblyName: string;
                offset: number;
                start: number;
                end: number;
                reversed?: boolean;
            } | undefined;
            readonly visibleRegions: import("@jbrowse/core/util/blockTypes").BaseBlock[];
        } & {
            rubberbandClickMenuItems(clickOffset: import("@jbrowse/plugin-linear-genome-view").BpOffset): import("@jbrowse/core/ui").MenuItem[];
        } & {
            afterCreate(): void;
            afterAttach(): void;
        }, import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
            minimized: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        } & {
            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
            offsetPx: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
            bpPerPx: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
            displayedRegions: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/core/util").Region[], import("@jbrowse/core/util").Region[], import("@jbrowse/core/util").Region[]>, [undefined]>;
            tracks: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IAnyType>;
            hideHeader: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            hideHeaderOverview: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            hideNoTracksActive: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            trackSelectorType: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            showCenterLine: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            showCytobandsSetting: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            trackLabels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            showGridlines: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            highlight: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view").HighlightType, import("@jbrowse/plugin-linear-genome-view").HighlightType, import("@jbrowse/plugin-linear-genome-view").HighlightType>>, [undefined]>;
            colorByCDS: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            showTrackOutlines: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            init: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined>;
        }>>, import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
            minimized: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        } & {
            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
            offsetPx: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
            bpPerPx: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
            displayedRegions: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/core/util").Region[], import("@jbrowse/core/util").Region[], import("@jbrowse/core/util").Region[]>, [undefined]>;
            tracks: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IAnyType>;
            hideHeader: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            hideHeaderOverview: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            hideNoTracksActive: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            trackSelectorType: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            showCenterLine: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            showCytobandsSetting: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            trackLabels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            showGridlines: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            highlight: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view").HighlightType, import("@jbrowse/plugin-linear-genome-view").HighlightType, import("@jbrowse/plugin-linear-genome-view").HighlightType>>, [undefined]>;
            colorByCDS: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            showTrackOutlines: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            init: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined>;
        }>>>) | undefined;
    } & {
        setClickedPosition(arg?: {
            structureSeqPos: number;
            code: string;
            chain: string;
        }): void;
        setClickGenomeHighlights(r: import("@jbrowse/core/util").Region[]): void;
        clearClickGenomeHighlights(): void;
        setHoverGenomeHighlights(r: import("@jbrowse/core/util").Region[]): void;
        clearHoverGenomeHighlights(): void;
        setAlignmentHoverRange(range?: {
            start: number;
            end: number;
        }): void;
        clearAlignmentHoverRange(): void;
        setClickAlignmentRange(range?: {
            start: number;
            end: number;
        }): void;
        clearClickAlignmentRange(): void;
        setSelectedFeatureId(uniqueId?: string): void;
        clearSelectedFeatureId(): void;
        setHoveredPosition(arg?: {
            structureSeqPos?: number;
            chain?: string;
            code?: string;
        }): void;
        setAlignment(r?: import("../mappings").PairwiseAlignment): void;
        setAlignmentStatus(str: string): void;
        setIsMouseInAlignment(val: boolean): void;
    } & {
        readonly uniprotId: string | undefined;
        readonly structureSeqToTranscriptSeqPosition: Record<number, number> | undefined;
        readonly transcriptSeqToStructureSeqPosition: Record<number, number> | undefined;
        readonly structurePositionToAlignmentMap: Record<number, number> | undefined;
        readonly transcriptPositionToAlignmentMap: Record<number, number> | undefined;
        readonly pairwiseAlignmentToTranscriptPosition: Record<number, number> | undefined;
        readonly pairwiseAlignmentToStructurePosition: Record<number, number> | undefined;
        readonly clickString: string;
        readonly hoverString: string;
        readonly genomeToTranscriptSeqMapping: {
            g2p: Record<number, number>;
            p2g: Record<number, number>;
            refName: string;
            strand: number;
        } | undefined;
        readonly structureSeqHoverPos: number | undefined;
        readonly alignmentHoverPos: number | undefined;
        readonly hoverStructureLetter: string | undefined;
        readonly hoverGenomeLetter: string | undefined;
        readonly alignmentMatchSet: Set<number> | undefined;
        readonly exactMatch: boolean;
        readonly parentView: import("./structureModel").ParentProteinView;
        readonly zoomToBaseLevel: boolean;
        readonly autoScrollAlignment: boolean;
        readonly showHighlight: boolean;
        readonly showProteinTracks: boolean;
        readonly alignmentAlgorithm: AlignmentAlgorithm;
        readonly molstarPluginContext: PluginContext | undefined;
        readonly structureIndex: number;
        readonly molstarStructure: import("molstar/lib/mol-model/structure").Structure | undefined;
    } & {
        highlightFromExternal(structureSeqPos: number): void;
        clearHighlightFromExternal(): void;
        hoverAlignmentPosition(alignmentPos: number): void;
        clickAlignmentPosition(alignmentPos: number): void;
    } & {
        afterAttach(): void;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    showControls: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    height: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    showHighlight: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    zoomToBaseLevel: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    autoScrollAlignment: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    showAlignment: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    showProteinTracks: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    alignmentAlgorithm: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    connectedMsaViewId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    init: import("@jbrowse/mobx-state-tree").IType<ProteinViewInitState | undefined, ProteinViewInitState | undefined, ProteinViewInitState | undefined>;
}, {
    width: number;
} & {
    menuItems(): import("@jbrowse/core/ui").MenuItem[];
} & {
    setDisplayName(name: string): void;
    setWidth(newWidth: number): void;
    setMinimized(flag: boolean): void;
} & {
    /**
     * #volatile
     */
    error: unknown;
    /**
     * #volatile
     */
    molstarPluginContext: PluginContext | undefined;
    /**
     * #volatile
     */
    showManualAlignmentDialog: boolean;
    /**
     * #volatile
     */
    showAddStructureDialog: boolean;
} & {
    /**
     * #action
     */
    setHeight(n: number): number;
    /**
     * #action
     */
    setShowAlignment(f: boolean): void;
    /**
     * #action
     */
    setShowControls(arg: boolean): void;
    /**
     * #action
     */
    setError(e: unknown): void;
    /**
     * #action
     */
    setShowHighlight(arg: boolean): void;
    /**
     * #action
     */
    setShowProteinTracks(arg: boolean): void;
    /**
     * #action
     */
    setZoomToBaseLevel(arg: boolean): void;
    /**
     * #action
     */
    setAutoScrollAlignment(arg: boolean): void;
    /**
     * #action
     */
    setAlignmentAlgorithm(algorithm: AlignmentAlgorithm): void;
    /**
     * #action
     */
    setMolstarPluginContext(p?: PluginContext): void;
    /**
     * #action
     */
    setShowManualAlignmentDialog(val: boolean): void;
    /**
     * #action
     */
    setShowAddStructureDialog(val: boolean): void;
    /**
     * #action
     */
    setInit(arg?: ProteinViewInitState): void;
    /**
     * #action
     */
    setConnectedMsaViewId(id?: string): void;
    /**
     * #action
     */
    addStructure(structure: {
        url?: string;
        data?: string;
    }): void;
} & {
    /**
     * #action
     */
    addStructureAndSuperpose(structure: {
        url?: string;
        data?: string;
    }): Promise<void>;
} & {
    afterAttach(): void;
} & {
    menuItems(): ({
        label: string;
        icon: import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").SvgIconTypeMap<{}, "svg">> & {
            muiName: string;
        };
        subMenu: ({
            label: string;
            type: string;
            checked: boolean;
            onClick: () => void;
        } | {
            label: string;
            onClick: () => void;
            type?: undefined;
            checked?: undefined;
        })[];
        onClick?: undefined;
    } | {
        label: string;
        onClick: () => void;
        icon?: undefined;
        subMenu?: undefined;
    })[];
}, import("@jbrowse/mobx-state-tree")._NotCustomized, {
    id: string;
    displayName: string | undefined;
    minimized: boolean;
} & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & import("@jbrowse/mobx-state-tree")._NotCustomized>;
export default stateModelFactory;
export type JBrowsePluginProteinViewStateModel = ReturnType<typeof stateModelFactory>;
export type JBrowsePluginProteinViewModel = Instance<JBrowsePluginProteinViewStateModel>;
export type JBrowsePluginProteinStructureStateModel = typeof Structure;
export type JBrowsePluginProteinStructureModel = Instance<JBrowsePluginProteinStructureStateModel>;
