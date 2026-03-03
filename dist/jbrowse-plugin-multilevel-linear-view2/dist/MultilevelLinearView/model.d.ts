import { Instance, SnapshotIn } from 'mobx-state-tree';
import { MenuItem } from '@jbrowse/core/ui';
import BaseResult from '@jbrowse/core/TextSearch/BaseResults';
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
import PluginManager from '@jbrowse/core/PluginManager';
export default function stateModelFactory(pluginManager: PluginManager): import("mobx-state-tree").IModelType<{
    id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
    displayName: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
    minimized: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
} & {
    id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("mobx-state-tree").ISimpleType<"MultilevelLinearView">;
    height: import("mobx-state-tree").IType<number | undefined, number, number>;
    trackSelectorType: import("mobx-state-tree").IType<string | undefined, string, string>;
    linkViews: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    interactToggled: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    isDescending: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    tracks: import("mobx-state-tree").IArrayType<import("mobx-state-tree").IAnyType>;
    views: import("mobx-state-tree").IArrayType<import("mobx-state-tree").IModelType<{
        id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
        displayName: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
        minimized: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    } & {
        id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
        type: import("mobx-state-tree").IType<string | undefined, string, string>;
        offsetPx: import("mobx-state-tree").IType<number | undefined, number, number>;
        bpPerPx: import("mobx-state-tree").IType<number | undefined, number, number>;
        displayedRegions: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").IType<import("@jbrowse/core/util").Region[], import("@jbrowse/core/util").Region[], import("@jbrowse/core/util").Region[]>, [undefined]>;
        tracks: import("mobx-state-tree").IArrayType<import("mobx-state-tree").IAnyType>;
        hideHeader: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        hideHeaderOverview: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        hideNoTracksActive: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        trackSelectorType: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
        showCenterLine: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<boolean>, [undefined]>;
        showCytobandsSetting: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<boolean>, [undefined]>;
        trackLabels: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
        showGridlines: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        highlight: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").IArrayType<import("mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").HighlightType, import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").HighlightType, import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").HighlightType>>, [undefined]>;
        colorByCDS: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<boolean>, [undefined]>;
        showTrackOutlines: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    }, {
        width: number;
    } & {
        menuItems(): MenuItem[];
    } & {
        setDisplayName(name: string): void;
        setWidth(newWidth: number): void;
        setMinimized(flag: boolean): void;
    } & {
        volatileWidth: number | undefined;
        minimumBlockWidth: number;
        draggingTrackId: string | undefined;
        volatileError: unknown;
        afterDisplayedRegionsSetCallbacks: (() => void)[];
        scaleFactor: number;
        trackRefs: Record<string, HTMLDivElement>;
        coarseDynamicBlocks: import("@jbrowse/core/util/blockTypes").BaseBlock[];
        coarseTotalBp: number;
        leftOffset: import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").BpOffset | undefined;
        rightOffset: import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").BpOffset | undefined;
    } & {
        readonly trackLabelsSetting: any;
        readonly width: number;
        readonly interRegionPaddingWidth: number;
        readonly assemblyNames: string[];
    } & {
        scaleBarDisplayPrefix(): string | undefined;
        MiniControlsComponent(): import("react").FC<any>;
        HeaderComponent(): import("react").FC<any>;
        readonly assembliesNotFound: string | undefined;
        readonly assemblyErrors: string;
        readonly assembliesInitialized: boolean;
        readonly initialized: boolean;
        readonly hasDisplayedRegions: boolean;
        readonly scaleBarHeight: number;
        readonly headerHeight: number;
        readonly trackHeights: number;
        readonly trackHeightsWithResizeHandles: number;
        readonly height: number;
        readonly totalBp: number;
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
            tracks: import("mobx-state-tree").IMSTArray<import("mobx-state-tree").IAnyType> & import("mobx-state-tree").IStateTreeNode<import("mobx-state-tree").IArrayType<import("mobx-state-tree").IAnyType>>;
        };
        getTrack(id: string): any;
        rankSearchResults(results: BaseResult[]): BaseResult[];
        rewriteOnClicks(trackType: string, viewMenuActions: MenuItem[]): void;
        readonly trackTypeActions: Map<string, MenuItem[]>;
    } & {
        setShowTrackOutlines(arg: boolean): void;
        setColorByCDS(flag: boolean): void;
        setShowCytobands(flag: boolean): void;
        setWidth(newWidth: number): void;
        setError(error: unknown): void;
        setHideHeader(b: boolean): void;
        setHideHeaderOverview(b: boolean): void;
        setHideNoTracksActive(b: boolean): void;
        setShowGridlines(b: boolean): void;
        addToHighlights(highlight: import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").HighlightType): void;
        setHighlight(highlight?: import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").HighlightType[] | undefined): void;
        removeHighlight(highlight: import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").HighlightType): void;
        scrollTo(offsetPx: number): number;
        zoomTo(bpPerPx: number, offset?: number | undefined, centerAtOffset?: boolean | undefined): number;
        setOffsets(left?: import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").BpOffset | undefined, right?: import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").BpOffset | undefined): void;
        setSearchResults(searchResults: BaseResult[], searchQuery: string, assemblyName?: string | undefined): void;
        setNewView(bpPerPx: number, offsetPx: number): void;
        horizontallyFlip(): void;
        showTrack(trackId: string, initialSnapshot?: {} | undefined, displayInitialSnapshot?: {} | undefined): any;
        hideTrack(trackId: string): number;
    } & {
        moveTrackDown(id: string): void;
        moveTrackUp(id: string): void;
        moveTrackToTop(id: string): void;
        moveTrackToBottom(id: string): void;
        moveTrack(movingId: string, targetId: string): void;
        toggleTrack(trackId: string): boolean;
        setTrackLabels(setting: "overlapping" | "offset" | "hidden"): void;
        setShowCenterLine(b: boolean): void;
        setDisplayedRegions(regions: import("@jbrowse/core/util").Region[]): void;
        activateTrackSelector(): import("@jbrowse/core/util").Widget;
        getSelectedRegions(leftOffset?: import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").BpOffset | undefined, rightOffset?: import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").BpOffset | undefined): {
            start: number;
            end: number;
            type: string;
            regionNumber?: number | undefined;
            reversed?: boolean | undefined;
            refName: string;
            assemblyName: string;
            key: string;
            offsetPx: number;
            widthPx: number;
            variant?: string | undefined;
            isLeftEndOfDisplayedRegion?: boolean | undefined;
        }[];
        afterDisplayedRegionsSet(cb: () => void): void;
        horizontalScroll(distance: number): number;
        center(): void;
        showAllRegions(): void;
        showAllRegionsInAssembly(assemblyName?: string | undefined): void;
        setDraggingTrackId(idx?: string | undefined): void;
        setScaleFactor(factor: number): void;
        clearView(): void;
        exportSvg(opts?: import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").ExportSvgOptions | undefined): Promise<void>;
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
        menuItems(): MenuItem[];
    } & {
        readonly staticBlocks: import("@jbrowse/core/util/blockTypes").BlockSet;
        readonly dynamicBlocks: import("@jbrowse/core/util/blockTypes").BlockSet;
        readonly roundedDynamicBlocks: import("@jbrowse/core/util/blockTypes").BaseBlock[];
        readonly visibleLocStrings: string;
        readonly coarseVisibleLocStrings: string;
    } & {
        setCoarseDynamicBlocks(blocks: import("@jbrowse/core/util/blockTypes").BlockSet): void;
        afterAttach(): void;
    } & {
        moveTo(start?: import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").BpOffset | undefined, end?: import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").BpOffset | undefined): void;
        navToLocString(input: string, optAssemblyName?: string | undefined): Promise<void>;
        navToSearchString({ input, assembly, }: {
            input: string;
            assembly: {
                configuration: any;
            } & import("mobx-state-tree/dist/internal").NonEmptyObject & {
                error: unknown;
                loadingP: Promise<void> | undefined;
                volatileRegions: import("@jbrowse/core/assemblyManager/assembly").BasicRegion[] | undefined;
                refNameAliases: {
                    [x: string]: string;
                } | undefined;
                lowerCaseRefNameAliases: {
                    [x: string]: string;
                } | undefined;
                cytobands: import("@jbrowse/core/util").Feature[] | undefined;
            } & {
                getConf(arg: string): any;
            } & {
                readonly initialized: boolean;
                readonly name: string;
                readonly regions: import("@jbrowse/core/assemblyManager/assembly").BasicRegion[] | undefined;
                readonly aliases: string[];
                readonly displayName: string | undefined;
                hasName(name: string): boolean;
                readonly allAliases: string[];
                readonly allRefNames: string[] | undefined;
                readonly lowerCaseRefNames: string[] | undefined;
                readonly allRefNamesWithLowerCase: string[] | undefined;
                readonly rpcManager: import("@jbrowse/core/rpc/RpcManager").default;
                readonly refNameColors: string[];
            } & {
                readonly refNames: string[] | undefined;
            } & {
                getCanonicalRefName(refName: string): string | undefined;
                getRefNameColor(refName: string): string | undefined;
                isValidRefName(refName: string): boolean;
            } & {
                setLoaded({ regions, refNameAliases, lowerCaseRefNameAliases, cytobands, }: {
                    regions: import("@jbrowse/core/util").Region[];
                    refNameAliases: {
                        [x: string]: string;
                    };
                    lowerCaseRefNameAliases: {
                        [x: string]: string;
                    };
                    cytobands: import("@jbrowse/core/util").Feature[];
                }): void;
                setError(e: unknown): void;
                setRegions(regions: import("@jbrowse/core/util").Region[]): void;
                setRefNameAliases(aliases: {
                    [x: string]: string;
                }, lowerCaseAliases: {
                    [x: string]: string;
                }): void;
                setCytobands(cytobands: import("@jbrowse/core/util").Feature[]): void;
                setLoadingP(p?: Promise<void> | undefined): void;
                load(): Promise<void>;
                loadPre(): Promise<void>;
            } & {
                getAdapterMapEntry(adapterConf: {
                    [x: string]: unknown;
                }, options: import("@jbrowse/core/data_adapters/BaseAdapter").BaseOptions): Promise<import("@jbrowse/core/assemblyManager/assembly").RefNameMap>;
                getRefNameMapForAdapter(adapterConf: {
                    [x: string]: unknown;
                }, opts: import("@jbrowse/core/data_adapters/BaseAdapter").BaseOptions): Promise<{
                    [x: string]: string;
                }>;
                getReverseRefNameMapForAdapter(adapterConf: {
                    [x: string]: unknown;
                }, opts: import("@jbrowse/core/data_adapters/BaseAdapter").BaseOptions): Promise<{
                    [x: string]: string;
                }>;
            } & import("mobx-state-tree").IStateTreeNode<import("mobx-state-tree").IModelType<{
                configuration: import("mobx-state-tree").IMaybe<import("mobx-state-tree").IReferenceType<import("mobx-state-tree").IAnyType>>;
            }, {
                error: unknown;
                loadingP: Promise<void> | undefined;
                volatileRegions: import("@jbrowse/core/assemblyManager/assembly").BasicRegion[] | undefined;
                refNameAliases: {
                    [x: string]: string;
                } | undefined;
                lowerCaseRefNameAliases: {
                    [x: string]: string;
                } | undefined;
                cytobands: import("@jbrowse/core/util").Feature[] | undefined;
            } & {
                getConf(arg: string): any;
            } & {
                readonly initialized: boolean;
                readonly name: string;
                readonly regions: import("@jbrowse/core/assemblyManager/assembly").BasicRegion[] | undefined;
                readonly aliases: string[];
                readonly displayName: string | undefined;
                hasName(name: string): boolean;
                readonly allAliases: string[];
                readonly allRefNames: string[] | undefined;
                readonly lowerCaseRefNames: string[] | undefined;
                readonly allRefNamesWithLowerCase: string[] | undefined;
                readonly rpcManager: import("@jbrowse/core/rpc/RpcManager").default;
                readonly refNameColors: string[];
            } & {
                readonly refNames: string[] | undefined;
            } & {
                getCanonicalRefName(refName: string): string | undefined;
                getRefNameColor(refName: string): string | undefined;
                isValidRefName(refName: string): boolean;
            } & {
                setLoaded({ regions, refNameAliases, lowerCaseRefNameAliases, cytobands, }: {
                    regions: import("@jbrowse/core/util").Region[];
                    refNameAliases: {
                        [x: string]: string;
                    };
                    lowerCaseRefNameAliases: {
                        [x: string]: string;
                    };
                    cytobands: import("@jbrowse/core/util").Feature[];
                }): void;
                setError(e: unknown): void;
                setRegions(regions: import("@jbrowse/core/util").Region[]): void;
                setRefNameAliases(aliases: {
                    [x: string]: string;
                }, lowerCaseAliases: {
                    [x: string]: string;
                }): void;
                setCytobands(cytobands: import("@jbrowse/core/util").Feature[]): void;
                setLoadingP(p?: Promise<void> | undefined): void;
                load(): Promise<void>;
                loadPre(): Promise<void>;
            } & {
                getAdapterMapEntry(adapterConf: {
                    [x: string]: unknown;
                }, options: import("@jbrowse/core/data_adapters/BaseAdapter").BaseOptions): Promise<import("@jbrowse/core/assemblyManager/assembly").RefNameMap>;
                getRefNameMapForAdapter(adapterConf: {
                    [x: string]: unknown;
                }, opts: import("@jbrowse/core/data_adapters/BaseAdapter").BaseOptions): Promise<{
                    [x: string]: string;
                }>;
                getReverseRefNameMapForAdapter(adapterConf: {
                    [x: string]: unknown;
                }, opts: import("@jbrowse/core/data_adapters/BaseAdapter").BaseOptions): Promise<{
                    [x: string]: string;
                }>;
            }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>>;
        }): Promise<void>;
        navToLocations(parsedLocStrings: import("@jbrowse/core/util").ParsedLocString[], assemblyName?: string | undefined): Promise<void>;
        navTo(query: import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").NavLocation): void;
        navToMultiple(locations: import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").NavLocation[]): void;
    } & {
        rubberBandMenuItems(): MenuItem[];
        bpToPx({ refName, coord, regionNumber, }: {
            refName: string;
            coord: number;
            regionNumber?: number | undefined;
        }): {
            index: number;
            offsetPx: number;
        } | undefined;
        centerAt(coord: number, refName: string, regionNumber?: number | undefined): void;
        pxToBp(px: number): {
            coord: number;
            index: number;
            refName: string;
            oob: boolean;
            assemblyName: string;
            offset: number;
            start: number;
            end: number;
            reversed?: boolean | undefined;
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
            reversed?: boolean | undefined;
        } | undefined;
    } & {
        afterCreate(): void;
    }, import("mobx-state-tree").ModelCreationType<import("mobx-state-tree/dist/internal").ExtractCFromProps<{
        id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
        displayName: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
        minimized: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    } & {
        id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
        type: import("mobx-state-tree").IType<string | undefined, string, string>;
        offsetPx: import("mobx-state-tree").IType<number | undefined, number, number>;
        bpPerPx: import("mobx-state-tree").IType<number | undefined, number, number>;
        displayedRegions: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").IType<import("@jbrowse/core/util").Region[], import("@jbrowse/core/util").Region[], import("@jbrowse/core/util").Region[]>, [undefined]>;
        tracks: import("mobx-state-tree").IArrayType<import("mobx-state-tree").IAnyType>;
        hideHeader: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        hideHeaderOverview: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        hideNoTracksActive: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        trackSelectorType: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
        showCenterLine: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<boolean>, [undefined]>;
        showCytobandsSetting: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<boolean>, [undefined]>;
        trackLabels: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
        showGridlines: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        highlight: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").IArrayType<import("mobx-state-tree").IType<import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").HighlightType, import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").HighlightType, import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").HighlightType>>, [undefined]>;
        colorByCDS: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<boolean>, [undefined]>;
        showTrackOutlines: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    }>>, import("mobx-state-tree")._NotCustomized>>;
}, {
    width: number;
} & {
    menuItems(): MenuItem[];
} & {
    setDisplayName(name: string): void;
    setWidth(newWidth: number): void;
    setMinimized(flag: boolean): void;
} & {
    headerHeight: number;
    width: number;
} & {
    readonly initialized: boolean;
    readonly refNames: any[][];
    readonly assemblyNames: string[];
    readonly numViews: number;
} & {
    setLimitBpPerPx(): void;
    setViews(views: SnapshotIn<LinearGenomeViewModel>[]): void;
} & {
    afterAttach(): void;
    beforeDestroy(): void;
    onSubviewAction(actionName: string, path: string, args?: any[]): void;
    setWidth(newWidth: number): void;
    setHeight(newHeight: number): void;
    insertView(location: number, view: any): void;
    setHeaderHeight(height: number): void;
    setIsDescending(toggle: boolean): void;
    toggleLinkViews(): void;
    alignViews(): void;
    reverseViewsDirection(): void;
    resetZooms(): void;
    clearView(): void;
    removeView(target: any): void;
} & {
    addView(isAbove: boolean, neighbour: any): Promise<void>;
} & {
    menuItems(): MenuItem[];
} & {
    searchScope(assemblyName: string): {
        assemblyName: string;
        includeAggregateIndexes: boolean;
        tracks: import("mobx-state-tree").IMSTArray<import("mobx-state-tree").IAnyType> & import("mobx-state-tree").IStateTreeNode<import("mobx-state-tree").IArrayType<import("mobx-state-tree").IAnyType>>;
    };
    rankSearchResults(results: BaseResult[]): BaseResult[];
}, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>;
export type MultilevelLinearViewStateModel = ReturnType<typeof stateModelFactory>;
export type MultilevelLinearViewModel = Instance<MultilevelLinearViewStateModel>;
