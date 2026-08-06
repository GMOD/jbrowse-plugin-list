import { type ProteinColorScheme } from './applyColorTheme';
import { type AlignmentAlgorithm } from './types';
import type { ProteinStructureSpec } from './proteinViewSpec';
import type { Instance } from '@jbrowse/mobx-state-tree';
import type { PluginContext } from 'molstar/lib/mol-plugin/context';
/**
 * #stateModel Protein3dViewPlugin
 * extends
 * - BaseViewModel
 */
declare function stateModelFactory(): import("@jbrowse/mobx-state-tree").IModelType<Omit<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    minimized: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
}, "id" | "type" | "colorScheme" | "height" | "structures" | "zoomToBaseLevel" | "showControls" | "showAlignment" | "showHighlight" | "showProteinTracks" | "compactTracks" | "autoScrollAlignment" | "alignmentAlgorithm" | "connectedMsaViewId"> & {
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"ProteinView">;
    structures: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
        url: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        data: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        connectedViewId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        pairwiseAlignment: import("@jbrowse/mobx-state-tree").IType<import("../mappings").PairwiseAlignment | undefined, import("../mappings").PairwiseAlignment | undefined, import("../mappings").PairwiseAlignment | undefined>;
        feature: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/core/util").SimpleFeatureSerialized | undefined, import("@jbrowse/core/util").SimpleFeatureSerialized | undefined, import("@jbrowse/core/util").SimpleFeatureSerialized | undefined>;
        userProvidedTranscriptSequence: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
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
    }, {
        clickedStructureRange: {
            start: number;
            end: number;
        } | undefined;
        hoverPosition: {
            structureSeqPos? /**
             * #action
             */: number;
            code?: string;
            chain?: string;
            source: "structure" | "genome";
        } | undefined;
        entities: import("./extractStructureSequences").Entity[] | undefined;
        mappedEntityIndex: number;
        structureConfidence: import("./loadStructureData").EntityConfidence | undefined;
        isMouseInAlignment: boolean;
        loadedToMolstar: boolean;
        molstarStructure: import("molstar/lib/mol-model/structure").Structure | undefined;
        alignmentHoverRange: {
            start: number;
            end: number;
        } | undefined;
        selectedFeatureId: string | undefined;
        hiddenFeatureTypes: Set<string>;
        expandedFeatureTypes: Set<string>;
    } & {
        setStructureData(data: import("./loadStructureData").StructureData): void;
        hideFeatureType(type: string): void;
        showFeatureType(type: string): void;
        showAllFeatureTypes(): void;
        toggleFeatureTypeExpanded(type: string): void;
        setLoadedToMolstar(val: boolean): void;
    } & {
        readonly connectedView: (import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
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
            highlightsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            labelsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            colorByCDS: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            showTrackOutlines: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            init: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined>;
        }> & {
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
            updateHighlight(old: import("@jbrowse/plugin-linear-genome-view").HighlightType, updates: Partial<import("@jbrowse/plugin-linear-genome-view").HighlightType>): void;
            setHighlightsVisible(arg: boolean): void;
            setLabelsVisible(arg: boolean): void;
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
            getHighlightCoords(region: {
                assemblyName?: string;
                refName: string;
                start: number;
                end: number;
            }): {
                width: number;
                left: number;
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
            highlightsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            labelsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
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
            updateHighlight(old: import("@jbrowse/plugin-linear-genome-view").HighlightType, updates: Partial<import("@jbrowse/plugin-linear-genome-view").HighlightType>): void;
            setHighlightsVisible(arg: boolean): void;
            setLabelsVisible(arg: boolean): void;
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
            getHighlightCoords(region: {
                assemblyName?: string;
                refName: string;
                start: number;
                end: number;
            }): {
                width: number;
                left: number;
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
        }, any, import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
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
            highlightsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            labelsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            colorByCDS: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            showTrackOutlines: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            init: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined>;
        }>>>) | undefined;
    } & {
        setClickedStructureRange(range?: {
            start: number;
            end: number;
        }): void;
        setAlignmentHoverRange(range?: {
            start: number;
            end: number;
        }): void;
        setSelectedFeatureId(uniqueId?: string): void;
        setHoveredPosition(arg?: {
            structureSeqPos?: number;
            chain?: string;
            code?: string;
        }): void;
        setGenomeHoveredPosition(structureSeqPos?: number): void;
        setAlignment(r?: import("../mappings").PairwiseAlignment): void;
        setMappedEntityIndex(n: number): void;
        setIsMouseInAlignment(val: boolean): void;
    } & {
        readonly structureSequences: string[] | undefined;
        readonly mappedEntity: import("./extractStructureSequences").Entity | undefined;
        readonly mappedStructureSeq: string | undefined;
        readonly mappedEntityId: string | undefined;
        readonly uniprotId: string | undefined;
        readonly coordinateMapper: import("./coordinates").CoordinateMapper | undefined;
        readonly structureSeqToTranscriptSeqPosition: Record<number, number> | undefined;
        readonly transcriptSeqToStructureSeqPosition: Record<number, number> | undefined;
        readonly structurePositionToAlignmentMap: Record<number, number> | undefined;
        readonly transcriptPositionToAlignmentMap: Record<number, number> | undefined;
        readonly confidenceCells: {
            col: number;
            value: number;
        }[];
        readonly hydrophobicityCells: {
            col: number;
            value: number;
        }[];
        readonly pairwiseAlignmentToTranscriptPosition: Record<number, number> | undefined;
        readonly pairwiseAlignmentToStructurePosition: Record<number, number> | undefined;
        readonly hoverString: string;
        readonly genomeToTranscriptSeqMapping: {
            g2p: Record<number, number>;
            p2g: Record<number, number>;
            p2gCodon: Record<number, number[]>;
            refName: string;
            strand: number;
        } | undefined;
        readonly structureSeqHoverPos: number | undefined;
        readonly alignmentHoverPos: import("./coordinates").AlignmentCol | undefined;
        readonly hoverStructureRange: {
            start: number;
            end: number;
        } | undefined;
        readonly hoverHighlightRange: {
            start: number;
            end: number;
        } | undefined;
        readonly labelSeqIdIndex: Map<number, number>;
        readonly selectLabelSeqIds: number[];
        readonly hoverLabelSeqIds: number[];
        readonly clickAlignmentRange: {
            start: number;
            end: number;
        } | undefined;
        structureRangeToGenomeHighlight(range: {
            start: number;
            end: number;
        } | undefined): import("@jbrowse/core/util").Region[];
        readonly hoverGenomeHighlights: import("@jbrowse/core/util").Region[];
        readonly clickGenomeHighlights: import("@jbrowse/core/util").Region[];
        readonly hoverStructureLetter: string | undefined;
        readonly hoverGenomeLetter: string | undefined;
        readonly alignmentMatchSet: Set<number> | undefined;
        readonly alignmentPending: boolean;
        readonly exactMatch: boolean;
        readonly parentView: import("./structureModel").ParentProteinView;
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
    colorScheme: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<"default" | "plddt-confidence" | "chain-id" | "secondary-structure" | "hydrophobicity" | "residue-name" | "uncertainty" | "molecule-type">, [undefined]>;
    showAlignment: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    showProteinTracks: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    compactTracks: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    alignmentAlgorithm: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<AlignmentAlgorithm>, [undefined]>;
    connectedMsaViewId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
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
    setCompactTracks(arg: boolean): void;
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
    setColorScheme(scheme: ProteinColorScheme): void;
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
    setConnectedMsaViewId(id?: string): void;
    /**
     * #action
     * Adds a structure at runtime (e.g. the Add-structure dialog). Takes the
     * full declarative spec so a dialog-added structure is a first-class
     * citizen, identical to one hydrated from a launch snapshot.
     */
    addStructure(structure: ProteinStructureSpec): void;
} & {
    afterAttach(): void;
} & {
    readonly primaryStructure: (import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        url: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        data: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        connectedViewId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        pairwiseAlignment: import("@jbrowse/mobx-state-tree").IType<import("../mappings").PairwiseAlignment | undefined, import("../mappings").PairwiseAlignment | undefined, import("../mappings").PairwiseAlignment | undefined>;
        feature: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/core/util").SimpleFeatureSerialized | undefined, import("@jbrowse/core/util").SimpleFeatureSerialized | undefined, import("@jbrowse/core/util").SimpleFeatureSerialized | undefined>;
        userProvidedTranscriptSequence: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
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
    }> & {
        clickedStructureRange: {
            start: number;
            end: number;
        } | undefined;
        hoverPosition: {
            structureSeqPos? /**
             * #action
             */: number;
            code?: string;
            chain?: string;
            source: "structure" | "genome";
        } | undefined;
        entities: import("./extractStructureSequences").Entity[] | undefined;
        mappedEntityIndex: number;
        structureConfidence: import("./loadStructureData").EntityConfidence | undefined;
        isMouseInAlignment: boolean;
        loadedToMolstar: boolean;
        molstarStructure: import("molstar/lib/mol-model/structure").Structure | undefined;
        alignmentHoverRange: {
            start: number;
            end: number;
        } | undefined;
        selectedFeatureId: string | undefined;
        hiddenFeatureTypes: Set<string>;
        expandedFeatureTypes: Set<string>;
    } & {
        setStructureData(data: import("./loadStructureData").StructureData): void;
        hideFeatureType(type: string): void;
        showFeatureType(type: string): void;
        showAllFeatureTypes(): void;
        toggleFeatureTypeExpanded(type: string): void;
        setLoadedToMolstar(val: boolean): void;
    } & {
        readonly connectedView: (import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
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
            highlightsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            labelsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            colorByCDS: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            showTrackOutlines: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            init: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined>;
        }> & {
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
            updateHighlight(old: import("@jbrowse/plugin-linear-genome-view").HighlightType, updates: Partial<import("@jbrowse/plugin-linear-genome-view").HighlightType>): void;
            setHighlightsVisible(arg: boolean): void;
            setLabelsVisible(arg: boolean): void;
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
            getHighlightCoords(region: {
                assemblyName?: string;
                refName: string;
                start: number;
                end: number;
            }): {
                width: number;
                left: number;
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
            highlightsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            labelsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
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
            updateHighlight(old: import("@jbrowse/plugin-linear-genome-view").HighlightType, updates: Partial<import("@jbrowse/plugin-linear-genome-view").HighlightType>): void;
            setHighlightsVisible(arg: boolean): void;
            setLabelsVisible(arg: boolean): void;
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
            getHighlightCoords(region: {
                assemblyName?: string;
                refName: string;
                start: number;
                end: number;
            }): {
                width: number;
                left: number;
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
        }, any, import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
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
            highlightsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            labelsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            colorByCDS: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            showTrackOutlines: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            init: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined>;
        }>>>) | undefined;
    } & {
        setClickedStructureRange(range?: {
            start: number;
            end: number;
        }): void;
        setAlignmentHoverRange(range?: {
            start: number;
            end: number;
        }): void;
        setSelectedFeatureId(uniqueId?: string): void;
        setHoveredPosition(arg?: {
            structureSeqPos?: number;
            chain?: string;
            code?: string;
        }): void;
        setGenomeHoveredPosition(structureSeqPos?: number): void;
        setAlignment(r?: import("../mappings").PairwiseAlignment): void;
        setMappedEntityIndex(n: number): void;
        setIsMouseInAlignment(val: boolean): void;
    } & {
        readonly structureSequences: string[] | undefined;
        readonly mappedEntity: import("./extractStructureSequences").Entity | undefined;
        readonly mappedStructureSeq: string | undefined;
        readonly mappedEntityId: string | undefined;
        readonly uniprotId: string | undefined;
        readonly coordinateMapper: import("./coordinates").CoordinateMapper | undefined;
        readonly structureSeqToTranscriptSeqPosition: Record<number, number> | undefined;
        readonly transcriptSeqToStructureSeqPosition: Record<number, number> | undefined;
        readonly structurePositionToAlignmentMap: Record<number, number> | undefined;
        readonly transcriptPositionToAlignmentMap: Record<number, number> | undefined;
        readonly confidenceCells: {
            col: number;
            value: number;
        }[];
        readonly hydrophobicityCells: {
            col: number;
            value: number;
        }[];
        readonly pairwiseAlignmentToTranscriptPosition: Record<number, number> | undefined;
        readonly pairwiseAlignmentToStructurePosition: Record<number, number> | undefined;
        readonly hoverString: string;
        readonly genomeToTranscriptSeqMapping: {
            g2p: Record<number, number>;
            p2g: Record<number, number>;
            p2gCodon: Record<number, number[]>;
            refName: string;
            strand: number;
        } | undefined;
        readonly structureSeqHoverPos: number | undefined;
        readonly alignmentHoverPos: import("./coordinates").AlignmentCol | undefined;
        readonly hoverStructureRange: {
            start: number;
            end: number;
        } | undefined;
        readonly hoverHighlightRange: {
            start: number;
            end: number;
        } | undefined;
        readonly labelSeqIdIndex: Map<number, number>;
        readonly selectLabelSeqIds: number[];
        readonly hoverLabelSeqIds: number[];
        readonly clickAlignmentRange: {
            start: number;
            end: number;
        } | undefined;
        structureRangeToGenomeHighlight(range: {
            start: number;
            end: number;
        } | undefined): import("@jbrowse/core/util").Region[];
        readonly hoverGenomeHighlights: import("@jbrowse/core/util").Region[];
        readonly clickGenomeHighlights: import("@jbrowse/core/util").Region[];
        readonly hoverStructureLetter: string | undefined;
        readonly hoverGenomeLetter: string | undefined;
        readonly alignmentMatchSet: Set<number> | undefined;
        readonly alignmentPending: boolean;
        readonly exactMatch: boolean;
        readonly parentView: import("./structureModel").ParentProteinView;
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
        hoverAlignmentPosition(alignmentPos: number): void;
        clickAlignmentPosition(alignmentPos: number): void;
    } & {
        afterAttach(): void;
    } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
        url: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        data: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        connectedViewId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        pairwiseAlignment: import("@jbrowse/mobx-state-tree").IType<import("../mappings").PairwiseAlignment | undefined, import("../mappings").PairwiseAlignment | undefined, import("../mappings").PairwiseAlignment | undefined>;
        feature: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/core/util").SimpleFeatureSerialized | undefined, import("@jbrowse/core/util").SimpleFeatureSerialized | undefined, import("@jbrowse/core/util").SimpleFeatureSerialized | undefined>;
        userProvidedTranscriptSequence: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
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
    }, {
        clickedStructureRange: {
            start: number;
            end: number;
        } | undefined;
        hoverPosition: {
            structureSeqPos? /**
             * #action
             */: number;
            code?: string;
            chain?: string;
            source: "structure" | "genome";
        } | undefined;
        entities: import("./extractStructureSequences").Entity[] | undefined;
        mappedEntityIndex: number;
        structureConfidence: import("./loadStructureData").EntityConfidence | undefined;
        isMouseInAlignment: boolean;
        loadedToMolstar: boolean;
        molstarStructure: import("molstar/lib/mol-model/structure").Structure | undefined;
        alignmentHoverRange: {
            start: number;
            end: number;
        } | undefined;
        selectedFeatureId: string | undefined;
        hiddenFeatureTypes: Set<string>;
        expandedFeatureTypes: Set<string>;
    } & {
        setStructureData(data: import("./loadStructureData").StructureData): void;
        hideFeatureType(type: string): void;
        showFeatureType(type: string): void;
        showAllFeatureTypes(): void;
        toggleFeatureTypeExpanded(type: string): void;
        setLoadedToMolstar(val: boolean): void;
    } & {
        readonly connectedView: (import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
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
            highlightsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            labelsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            colorByCDS: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            showTrackOutlines: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            init: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined>;
        }> & {
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
            updateHighlight(old: import("@jbrowse/plugin-linear-genome-view").HighlightType, updates: Partial<import("@jbrowse/plugin-linear-genome-view").HighlightType>): void;
            setHighlightsVisible(arg: boolean): void;
            setLabelsVisible(arg: boolean): void;
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
            getHighlightCoords(region: {
                assemblyName?: string;
                refName: string;
                start: number;
                end: number;
            }): {
                width: number;
                left: number;
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
            highlightsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            labelsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
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
            updateHighlight(old: import("@jbrowse/plugin-linear-genome-view").HighlightType, updates: Partial<import("@jbrowse/plugin-linear-genome-view").HighlightType>): void;
            setHighlightsVisible(arg: boolean): void;
            setLabelsVisible(arg: boolean): void;
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
            getHighlightCoords(region: {
                assemblyName?: string;
                refName: string;
                start: number;
                end: number;
            }): {
                width: number;
                left: number;
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
        }, any, import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
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
            highlightsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            labelsVisible: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            colorByCDS: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            showTrackOutlines: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
            init: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined, import("@jbrowse/plugin-linear-genome-view").InitState | undefined>;
        }>>>) | undefined;
    } & {
        setClickedStructureRange(range?: {
            start: number;
            end: number;
        }): void;
        setAlignmentHoverRange(range?: {
            start: number;
            end: number;
        }): void;
        setSelectedFeatureId(uniqueId?: string): void;
        setHoveredPosition(arg?: {
            structureSeqPos?: number;
            chain?: string;
            code?: string;
        }): void;
        setGenomeHoveredPosition(structureSeqPos?: number): void;
        setAlignment(r?: import("../mappings").PairwiseAlignment): void;
        setMappedEntityIndex(n: number): void;
        setIsMouseInAlignment(val: boolean): void;
    } & {
        readonly structureSequences: string[] | undefined;
        readonly mappedEntity: import("./extractStructureSequences").Entity | undefined;
        readonly mappedStructureSeq: string | undefined;
        readonly mappedEntityId: string | undefined;
        readonly uniprotId: string | undefined;
        readonly coordinateMapper: import("./coordinates").CoordinateMapper | undefined;
        readonly structureSeqToTranscriptSeqPosition: Record<number, number> | undefined;
        readonly transcriptSeqToStructureSeqPosition: Record<number, number> | undefined;
        readonly structurePositionToAlignmentMap: Record<number, number> | undefined;
        readonly transcriptPositionToAlignmentMap: Record<number, number> | undefined;
        readonly confidenceCells: {
            col: number;
            value: number;
        }[];
        readonly hydrophobicityCells: {
            col: number;
            value: number;
        }[];
        readonly pairwiseAlignmentToTranscriptPosition: Record<number, number> | undefined;
        readonly pairwiseAlignmentToStructurePosition: Record<number, number> | undefined;
        readonly hoverString: string;
        readonly genomeToTranscriptSeqMapping: {
            g2p: Record<number, number>;
            p2g: Record<number, number>;
            p2gCodon: Record<number, number[]>;
            refName: string;
            strand: number;
        } | undefined;
        readonly structureSeqHoverPos: number | undefined;
        readonly alignmentHoverPos: import("./coordinates").AlignmentCol | undefined;
        readonly hoverStructureRange: {
            start: number;
            end: number;
        } | undefined;
        readonly hoverHighlightRange: {
            start: number;
            end: number;
        } | undefined;
        readonly labelSeqIdIndex: Map<number, number>;
        readonly selectLabelSeqIds: number[];
        readonly hoverLabelSeqIds: number[];
        readonly clickAlignmentRange: {
            start: number;
            end: number;
        } | undefined;
        structureRangeToGenomeHighlight(range: {
            start: number;
            end: number;
        } | undefined): import("@jbrowse/core/util").Region[];
        readonly hoverGenomeHighlights: import("@jbrowse/core/util").Region[];
        readonly clickGenomeHighlights: import("@jbrowse/core/util").Region[];
        readonly hoverStructureLetter: string | undefined;
        readonly hoverGenomeLetter: string | undefined;
        readonly alignmentMatchSet: Set<number> | undefined;
        readonly alignmentPending: boolean;
        readonly exactMatch: boolean;
        readonly parentView: import("./structureModel").ParentProteinView;
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
        hoverAlignmentPosition(alignmentPos: number): void;
        clickAlignmentPosition(alignmentPos: number): void;
    } & {
        afterAttach(): void;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
    menuItems(): ({
        label: string;
        icon: import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").SvgIconTypeMap<{}, "svg">> & {
            muiName: string;
        };
        type: string;
        checked: boolean;
        onClick: () => void;
        subMenu?: undefined;
    } | {
        label: string;
        subMenu: {
            label: "Default (element/chain)" | "pLDDT confidence (AlphaFold)" | "Chain" | "Secondary structure" | "Hydrophobicity (Kyte-Doolittle)" | "Residue type" | "B-factor / uncertainty" | "Molecule type";
            type: "radio";
            checked: boolean;
            onClick: () => void;
        }[];
        icon?: undefined;
        type?: undefined;
        checked?: undefined;
        onClick?: undefined;
    } | {
        label: string;
        onClick: () => void;
        icon?: undefined;
        type?: undefined;
        checked?: undefined;
        subMenu?: undefined;
    } | {
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
        type?: undefined;
        checked?: undefined;
        onClick?: undefined;
    })[];
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    minimized: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
}> & import("@jbrowse/mobx-state-tree")._NotCustomized>;
export default stateModelFactory;
export type JBrowsePluginProteinViewStateModel = ReturnType<typeof stateModelFactory>;
export type JBrowsePluginProteinViewModel = Instance<JBrowsePluginProteinViewStateModel>;
export type { JBrowsePluginProteinStructureModel, JBrowsePluginProteinStructureStateModel, } from './structureModel';
