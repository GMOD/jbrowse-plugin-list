import type { NodeWithIds, NodeWithIdsAndLength, Sample } from './types';
import type PluginManager from '@jbrowse/core/PluginManager';
import type { AnyConfigurationModel, AnyConfigurationSchemaType } from '@jbrowse/core/configuration';
import type { Instance } from '@jbrowse/mobx-state-tree';
import type { ExportSvgDisplayOptions } from '@jbrowse/plugin-linear-genome-view';
import type { HierarchyNode } from 'd3-hierarchy';
/**
 * #stateModel LinearMafDisplay
 * extends LinearBasicDisplay
 */
export default function stateModelFactory(configSchema: AnyConfigurationSchemaType, pluginManager: PluginManager): import("@jbrowse/mobx-state-tree").IModelType<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
} & {
    heightPreConfig: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
} & {
    userBpPerPxLimit: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
    userByteSizeLimit: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
} & {
    blockState: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
        key: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        region: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/core/util").Region, import("@jbrowse/core/util").Region, import("@jbrowse/core/util").Region>;
        reloadFlag: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
        isLeftEndOfDisplayedRegion: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        isRightEndOfDisplayedRegion: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    }, {
        stopToken: import("@jbrowse/core/util").StopToken | undefined;
        filled: boolean;
        reactElement: React.ReactElement | undefined;
        features: Map<string, import("@jbrowse/core/util").Feature> | undefined;
        layout: any;
        blockStatusMessage: string;
        error: unknown;
        message: string | undefined;
        maxHeightReached: boolean;
        ReactComponent: ({ model, }: {
            model: {
                error?: unknown;
                reload: () => void;
                message?: React.ReactNode;
                statusMessage?: string;
                reactElement?: React.ReactElement;
                isRenderingPending?: boolean;
            };
        }) => import("react/jsx-runtime").JSX.Element;
        renderProps: any;
        renderArgs: Record<string, unknown> | undefined;
        isRenderingPending: boolean;
        cachedDisplay: import("@jbrowse/core/util").AbstractDisplayModel | undefined;
    } & {
        doReload(): void;
        setStatusMessage(message: string): void;
        setLoading(newStopToken: import("@jbrowse/core/util").StopToken): void;
        setMessage(messageText: string): void;
        setRendered(props: import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/models/serverSideRenderedBlock").RenderedProps | undefined): void;
        setError(error: unknown): void;
        reload(): void;
        setCachedDisplay(display: import("@jbrowse/core/util").AbstractDisplayModel): void;
        beforeDestroy(): void;
    } & {
        readonly statusMessage: any;
    } & {
        afterAttach(): void;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    configuration: import("node_modules/@jbrowse/core/src/configuration/configurationSchema.ts").ConfigurationSchemaType<{
        maxFeatureScreenDensity: {
            type: string;
            description: string;
            defaultValue: number;
        };
        fetchSizeLimit: {
            type: string;
            defaultValue: number;
            description: string;
        };
        height: {
            type: string;
            defaultValue: number;
            description: string;
        };
        mouseover: {
            type: string;
            description: string;
            defaultValue: string;
            contextVariable: string[];
        };
        jexlFilters: {
            type: string;
            description: string;
            defaultValue: never[];
        };
    }, import("node_modules/@jbrowse/core/src/configuration/configurationSchema.ts").ConfigurationSchemaOptions<undefined, "displayId">>;
    showLegend: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
    showTooltips: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
} & {
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"LinearMafDisplay">;
    configuration: AnyConfigurationSchemaType;
    rowHeight: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    rowProportion: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    showAllLetters: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    mismatchRendering: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    showBranchLen: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    treeAreaWidth: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    showAsUpperCase: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    showSidebar: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    subtreeFilter: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
}, {
    rendererTypeName: string;
    error: unknown;
    statusMessage: string | undefined;
} & {
    readonly RenderingComponent: React.FC<{
        model: {
            id: string;
            type: string;
            rpcDriverName: string | undefined;
        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
            rendererTypeName: string;
            error: unknown;
            statusMessage: string | undefined;
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        }, {
            rendererTypeName: string;
            error: unknown;
            statusMessage: string | undefined;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
        onHorizontalScroll?: () => void;
        blockState?: Record<string, any>;
    }>;
    readonly DisplayBlurb: React.FC<{
        model: {
            id: string;
            type: string;
            rpcDriverName: string | undefined;
        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
            rendererTypeName: string;
            error: unknown;
            statusMessage: string | undefined;
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        }, {
            rendererTypeName: string;
            error: unknown;
            statusMessage: string | undefined;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }> | null;
    readonly adapterConfig: any;
    readonly parentTrack: import("@jbrowse/core/util").AbstractTrackModel;
    readonly isMinimized: boolean;
    readonly parentDisplay: any;
    readonly effectiveRpcDriverName: any;
} & {
    renderProps(): any;
    renderingProps(): {
        displayModel: {
            id: string;
            type: string;
            rpcDriverName: string | undefined;
        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
            rendererTypeName: string;
            error: unknown;
            statusMessage: string | undefined;
        } & {
            readonly RenderingComponent: React.FC<{
                model: {
                    id: string;
                    type: string;
                    rpcDriverName: string | undefined;
                } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                }, {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                onHorizontalScroll?: () => void;
                blockState?: Record<string, any>;
            }>;
            readonly DisplayBlurb: React.FC<{
                model: {
                    id: string;
                    type: string;
                    rpcDriverName: string | undefined;
                } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                }, {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }> | null;
            readonly adapterConfig: any;
            readonly parentTrack: import("@jbrowse/core/util").AbstractTrackModel;
            readonly isMinimized: boolean;
            readonly parentDisplay: any;
            readonly effectiveRpcDriverName: any;
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        }, {
            rendererTypeName: string;
            error: unknown;
            statusMessage: string | undefined;
        } & {
            readonly RenderingComponent: React.FC<{
                model: {
                    id: string;
                    type: string;
                    rpcDriverName: string | undefined;
                } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                }, {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                onHorizontalScroll?: () => void;
                blockState?: Record<string, any>;
            }>;
            readonly DisplayBlurb: React.FC<{
                model: {
                    id: string;
                    type: string;
                    rpcDriverName: string | undefined;
                } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                }, {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }> | null;
            readonly adapterConfig: any;
            readonly parentTrack: import("@jbrowse/core/util").AbstractTrackModel;
            readonly isMinimized: boolean;
            readonly parentDisplay: any;
            readonly effectiveRpcDriverName: any;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    };
    readonly rendererType: import("@jbrowse/core/pluggableElementTypes").RendererType;
    readonly DisplayMessageComponent: undefined | React.FC<any>;
    trackMenuItems(): import("@jbrowse/core/ui").MenuItem[];
    readonly viewMenuActions: import("@jbrowse/core/ui").MenuItem[];
    regionCannotBeRendered(): null;
} & {
    setStatusMessage(arg?: string): void;
    setError(error?: unknown): void;
    setRpcDriverName(rpcDriverName: string): void;
    reload(): void;
} & {
    scrollTop: number;
} & {
    readonly height: number;
} & {
    setScrollTop(scrollTop: number): void;
    setHeight(displayHeight: number): number;
    resizeHeight(distance: number): number;
} & {
    featureDensityStatsP: undefined | Promise<import("@jbrowse/core/data_adapters/BaseAdapter").FeatureDensityStats>;
    featureDensityStats: undefined | import("@jbrowse/core/data_adapters/BaseAdapter").FeatureDensityStats;
    currStatsBpPerPx: number;
} & {
    readonly currentBytesRequested: number;
    readonly currentFeatureScreenDensity: number;
    readonly maxFeatureScreenDensity: any;
    readonly featureDensityStatsReady: boolean;
    readonly maxAllowableBytes: number;
} & {
    afterAttach(): void;
} & {
    setCurrStatsBpPerPx(n: number): void;
    setFeatureDensityStatsLimit(stats?: import("@jbrowse/core/data_adapters/BaseAdapter").FeatureDensityStats): void;
    getFeatureDensityStats(): Promise<import("@jbrowse/core/data_adapters/BaseAdapter").FeatureDensityStats>;
    setFeatureDensityStatsP(arg: any): void;
    setFeatureDensityStats(featureDensityStats?: import("@jbrowse/core/data_adapters/BaseAdapter").FeatureDensityStats): void;
    clearFeatureDensityStats(): void;
} & {
    readonly regionTooLarge: boolean;
    readonly regionTooLargeReason: string;
} & {
    readonly featureDensityStatsReadyAndRegionNotTooLarge: boolean;
    regionCannotBeRenderedText(_region: import("@jbrowse/core/util").Region): "" | "Force load to see features";
    regionCannotBeRendered(_region: import("@jbrowse/core/util").Region): import("react/jsx-runtime").JSX.Element | null;
} & {
    mouseoverExtraInformation: string | undefined;
    featureIdUnderMouse: undefined | string;
    subfeatureIdUnderMouse: undefined | string;
    contextMenuFeature: undefined | import("@jbrowse/core/util").Feature;
} & {
    readonly DisplayMessageComponent: undefined | React.FC<any>;
    readonly blockType: "staticBlocks" | "dynamicBlocks";
    readonly blockDefinitions: import("@jbrowse/core/util/blockTypes").BlockSet;
} & {
    readonly renderDelay: number;
    readonly TooltipComponent: import("@jbrowse/core/util").AnyReactComponentType;
    legendItems(_theme?: import("@mui/material").Theme): import("@jbrowse/plugin-linear-genome-view").LegendItem[];
    svgLegendWidth(theme?: import("@mui/material").Theme): number;
    readonly selectedFeatureId: string | undefined;
    readonly featureWidgetType: {
        type: string;
        id: string;
    };
} & {
    readonly showTooltipsEnabled: boolean;
    readonly features: import("@jbrowse/core/util/compositeMap").default<string, import("@jbrowse/core/util").Feature>;
    readonly featureUnderMouse: import("@jbrowse/core/util").Feature | undefined;
    getFeatureById(featureId: string, parentFeatureId?: string): import("@jbrowse/core/util").Feature | undefined;
    readonly layoutFeatures: import("@jbrowse/core/util/compositeMap").default<string, import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/types").LayoutRecord>;
    getFeatureOverlapping(blockKey: string, x: number, y: number): string | undefined;
    getFeatureByID(blockKey: string, id: string): import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/types").LayoutRecord | undefined;
    searchFeatureByID(id: string): import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/types").LayoutRecord | undefined;
    readonly floatingLabelData: Map<string, import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/components/util").FeatureLabelData>;
} & {
    addBlock(key: string, block: import("@jbrowse/core/util/blockTypes").BaseBlock): void;
    deleteBlock(key: string): void;
    selectFeature(feature: import("@jbrowse/core/util").Feature): void;
    navToFeature(feature: import("@jbrowse/core/util").Feature): void;
    clearFeatureSelection(): void;
    setFeatureIdUnderMouse(feature?: string): void;
    setSubfeatureIdUnderMouse(subfeatureId?: string): void;
    setContextMenuFeature(feature?: import("@jbrowse/core/util").Feature): void;
    setMouseoverExtraInformation(extra?: string): void;
    setShowLegend(s: boolean): void;
    setShowTooltips(arg: boolean): void;
} & {
    reload(): Promise<void>;
} & {
    selectFeatureById: (featureId: string, parentFeatureId?: string | undefined, topLevelFeatureId?: string | undefined) => Promise<void>;
    setContextMenuFeatureById: (featureId: string, parentFeatureId?: string | undefined, topLevelFeatureId?: string | undefined) => Promise<void>;
} & {
    trackMenuItems(): import("@jbrowse/core/ui").MenuItem[];
    contextMenuItems(): import("@jbrowse/core/ui").MenuItem[];
    renderingProps(): {
        displayModel: {
            id: string;
            type: string;
            rpcDriverName: string | undefined;
            heightPreConfig: number | undefined;
            userBpPerPxLimit: number | undefined;
            userByteSizeLimit: number | undefined;
            blockState: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                key: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                region: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/core/util").Region, import("@jbrowse/core/util").Region, import("@jbrowse/core/util").Region>;
                reloadFlag: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
                isLeftEndOfDisplayedRegion: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
                isRightEndOfDisplayedRegion: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            }, {
                stopToken: import("@jbrowse/core/util").StopToken | undefined;
                filled: boolean;
                reactElement: React.ReactElement | undefined;
                features: Map<string, import("@jbrowse/core/util").Feature> | undefined;
                layout: any;
                blockStatusMessage: string;
                error: unknown;
                message: string | undefined;
                maxHeightReached: boolean;
                ReactComponent: ({ model, }: {
                    model: {
                        error?: unknown;
                        reload: () => void;
                        message?: React.ReactNode;
                        statusMessage?: string;
                        reactElement?: React.ReactElement;
                        isRenderingPending?: boolean;
                    };
                }) => import("react/jsx-runtime").JSX.Element;
                renderProps: any;
                renderArgs: Record<string, unknown> | undefined;
                isRenderingPending: boolean;
                cachedDisplay: import("@jbrowse/core/util").AbstractDisplayModel | undefined;
            } & {
                doReload(): void;
                setStatusMessage(message: string): void;
                setLoading(newStopToken: import("@jbrowse/core/util").StopToken): void;
                setMessage(messageText: string): void;
                setRendered(props: import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/models/serverSideRenderedBlock").RenderedProps | undefined): void;
                setError(error: unknown): void;
                reload(): void;
                setCachedDisplay(display: import("@jbrowse/core/util").AbstractDisplayModel): void;
                beforeDestroy(): void;
            } & {
                readonly statusMessage: any;
            } & {
                afterAttach(): void;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                key: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                region: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/core/util").Region, import("@jbrowse/core/util").Region, import("@jbrowse/core/util").Region>;
                reloadFlag: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
                isLeftEndOfDisplayedRegion: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
                isRightEndOfDisplayedRegion: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            }, {
                stopToken: import("@jbrowse/core/util").StopToken | undefined;
                filled: boolean;
                reactElement: React.ReactElement | undefined;
                features: Map<string, import("@jbrowse/core/util").Feature> | undefined;
                layout: any;
                blockStatusMessage: string;
                error: unknown;
                message: string | undefined;
                maxHeightReached: boolean;
                ReactComponent: ({ model, }: {
                    model: {
                        error?: unknown;
                        reload: () => void;
                        message?: React.ReactNode;
                        statusMessage?: string;
                        reactElement?: React.ReactElement;
                        isRenderingPending?: boolean;
                    };
                }) => import("react/jsx-runtime").JSX.Element;
                renderProps: any;
                renderArgs: Record<string, unknown> | undefined;
                isRenderingPending: boolean;
                cachedDisplay: import("@jbrowse/core/util").AbstractDisplayModel | undefined;
            } & {
                doReload(): void;
                setStatusMessage(message: string): void;
                setLoading(newStopToken: import("@jbrowse/core/util").StopToken): void;
                setMessage(messageText: string): void;
                setRendered(props: import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/models/serverSideRenderedBlock").RenderedProps | undefined): void;
                setError(error: unknown): void;
                reload(): void;
                setCachedDisplay(display: import("@jbrowse/core/util").AbstractDisplayModel): void;
                beforeDestroy(): void;
            } & {
                readonly statusMessage: any;
            } & {
                afterAttach(): void;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
            configuration: {
                [x: string]: any;
            } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
                    [x: string]: any;
                } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                    setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
                        [x: string]: any;
                    } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & any & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("node_modules/@jbrowse/core/src/configuration/configurationSchema.ts").ConfigurationSchemaType<{
                maxFeatureScreenDensity: {
                    type: string;
                    description: string;
                    defaultValue: number;
                };
                fetchSizeLimit: {
                    type: string;
                    defaultValue: number;
                    description: string;
                };
                height: {
                    type: string;
                    defaultValue: number;
                    description: string;
                };
                mouseover: {
                    type: string;
                    description: string;
                    defaultValue: string;
                    contextVariable: string[];
                };
                jexlFilters: {
                    type: string;
                    description: string;
                    defaultValue: never[];
                };
            }, import("node_modules/@jbrowse/core/src/configuration/configurationSchema.ts").ConfigurationSchemaOptions<undefined, "displayId">>>;
            showLegend: boolean | undefined;
            showTooltips: boolean | undefined;
        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
            rendererTypeName: string;
            error: unknown;
            statusMessage: string | undefined;
        } & {
            readonly RenderingComponent: React.FC<{
                model: {
                    id: string;
                    type: string;
                    rpcDriverName: string | undefined;
                } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                }, {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                onHorizontalScroll?: () => void;
                blockState?: Record<string, any>;
            }>;
            readonly DisplayBlurb: React.FC<{
                model: {
                    id: string;
                    type: string;
                    rpcDriverName: string | undefined;
                } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                }, {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }> | null;
            readonly adapterConfig: any;
            readonly parentTrack: import("@jbrowse/core/util").AbstractTrackModel;
            readonly isMinimized: boolean;
            readonly parentDisplay: any;
            readonly effectiveRpcDriverName: any;
        } & {
            renderProps(): any;
            renderingProps(): {
                displayModel: {
                    id: string;
                    type: string;
                    rpcDriverName: string | undefined;
                } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                } & {
                    readonly RenderingComponent: React.FC<{
                        model: {
                            id: string;
                            type: string;
                            rpcDriverName: string | undefined;
                        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                        }, {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                        onHorizontalScroll?: () => void;
                        blockState?: Record<string, any>;
                    }>;
                    readonly DisplayBlurb: React.FC<{
                        model: {
                            id: string;
                            type: string;
                            rpcDriverName: string | undefined;
                        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                        }, {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                    }> | null;
                    readonly adapterConfig: any;
                    readonly parentTrack: import("@jbrowse/core/util").AbstractTrackModel;
                    readonly isMinimized: boolean;
                    readonly parentDisplay: any;
                    readonly effectiveRpcDriverName: any;
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                }, {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                } & {
                    readonly RenderingComponent: React.FC<{
                        model: {
                            id: string;
                            type: string;
                            rpcDriverName: string | undefined;
                        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                        }, {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                        onHorizontalScroll?: () => void;
                        blockState?: Record<string, any>;
                    }>;
                    readonly DisplayBlurb: React.FC<{
                        model: {
                            id: string;
                            type: string;
                            rpcDriverName: string | undefined;
                        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                        }, {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                    }> | null;
                    readonly adapterConfig: any;
                    readonly parentTrack: import("@jbrowse/core/util").AbstractTrackModel;
                    readonly isMinimized: boolean;
                    readonly parentDisplay: any;
                    readonly effectiveRpcDriverName: any;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            };
            readonly rendererType: import("@jbrowse/core/pluggableElementTypes").RendererType;
            readonly DisplayMessageComponent: undefined | React.FC<any>;
            trackMenuItems(): import("@jbrowse/core/ui").MenuItem[];
            readonly viewMenuActions: import("@jbrowse/core/ui").MenuItem[];
            regionCannotBeRendered(): null;
        } & {
            setStatusMessage(arg?: string): void;
            setError(error?: unknown): void;
            setRpcDriverName(rpcDriverName: string): void;
            reload(): void;
        } & {
            scrollTop: number;
        } & {
            readonly height: number;
        } & {
            setScrollTop(scrollTop: number): void;
            setHeight(displayHeight: number): number;
            resizeHeight(distance: number): number;
        } & {
            featureDensityStatsP: undefined | Promise<import("@jbrowse/core/data_adapters/BaseAdapter").FeatureDensityStats>;
            featureDensityStats: undefined | import("@jbrowse/core/data_adapters/BaseAdapter").FeatureDensityStats;
            currStatsBpPerPx: number;
        } & {
            readonly currentBytesRequested: number;
            readonly currentFeatureScreenDensity: number;
            readonly maxFeatureScreenDensity: any;
            readonly featureDensityStatsReady: boolean;
            readonly maxAllowableBytes: number;
        } & {
            afterAttach(): void;
        } & {
            setCurrStatsBpPerPx(n: number): void;
            setFeatureDensityStatsLimit(stats?: import("@jbrowse/core/data_adapters/BaseAdapter").FeatureDensityStats): void;
            getFeatureDensityStats(): Promise<import("@jbrowse/core/data_adapters/BaseAdapter").FeatureDensityStats>;
            setFeatureDensityStatsP(arg: any): void;
            setFeatureDensityStats(featureDensityStats?: import("@jbrowse/core/data_adapters/BaseAdapter").FeatureDensityStats): void;
            clearFeatureDensityStats(): void;
        } & {
            readonly regionTooLarge: boolean;
            readonly regionTooLargeReason: string;
        } & {
            readonly featureDensityStatsReadyAndRegionNotTooLarge: boolean;
            regionCannotBeRenderedText(_region: import("@jbrowse/core/util").Region): "" | "Force load to see features";
            regionCannotBeRendered(_region: import("@jbrowse/core/util").Region): import("react/jsx-runtime").JSX.Element | null;
        } & {
            mouseoverExtraInformation: string | undefined;
            featureIdUnderMouse: undefined | string;
            subfeatureIdUnderMouse: undefined | string;
            contextMenuFeature: undefined | import("@jbrowse/core/util").Feature;
        } & {
            readonly DisplayMessageComponent: undefined | React.FC<any>;
            readonly blockType: "staticBlocks" | "dynamicBlocks";
            readonly blockDefinitions: import("@jbrowse/core/util/blockTypes").BlockSet;
        } & {
            readonly renderDelay: number;
            readonly TooltipComponent: import("@jbrowse/core/util").AnyReactComponentType;
            legendItems(_theme?: import("@mui/material").Theme): import("@jbrowse/plugin-linear-genome-view").LegendItem[];
            svgLegendWidth(theme?: import("@mui/material").Theme): number;
            readonly selectedFeatureId: string | undefined;
            readonly featureWidgetType: {
                type: string;
                id: string;
            };
        } & {
            readonly showTooltipsEnabled: boolean;
            readonly features: import("@jbrowse/core/util/compositeMap").default<string, import("@jbrowse/core/util").Feature>;
            readonly featureUnderMouse: import("@jbrowse/core/util").Feature | undefined;
            getFeatureById(featureId: string, parentFeatureId?: string): import("@jbrowse/core/util").Feature | undefined;
            readonly layoutFeatures: import("@jbrowse/core/util/compositeMap").default<string, import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/types").LayoutRecord>;
            getFeatureOverlapping(blockKey: string, x: number, y: number): string | undefined;
            getFeatureByID(blockKey: string, id: string): import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/types").LayoutRecord | undefined;
            searchFeatureByID(id: string): import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/types").LayoutRecord | undefined;
            readonly floatingLabelData: Map<string, import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/components/util").FeatureLabelData>;
        } & {
            addBlock(key: string, block: import("@jbrowse/core/util/blockTypes").BaseBlock): void;
            deleteBlock(key: string): void;
            selectFeature(feature: import("@jbrowse/core/util").Feature): void;
            navToFeature(feature: import("@jbrowse/core/util").Feature): void;
            clearFeatureSelection(): void;
            setFeatureIdUnderMouse(feature?: string): void;
            setSubfeatureIdUnderMouse(subfeatureId?: string): void;
            setContextMenuFeature(feature?: import("@jbrowse/core/util").Feature): void;
            setMouseoverExtraInformation(extra?: string): void;
            setShowLegend(s: boolean): void;
            setShowTooltips(arg: boolean): void;
        } & {
            reload(): Promise<void>;
        } & {
            selectFeatureById: (featureId: string, parentFeatureId?: string | undefined, topLevelFeatureId?: string | undefined) => Promise<void>;
            setContextMenuFeatureById: (featureId: string, parentFeatureId?: string | undefined, topLevelFeatureId?: string | undefined) => Promise<void>;
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        } & {
            heightPreConfig: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
        } & {
            userBpPerPxLimit: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
            userByteSizeLimit: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
        } & {
            blockState: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                key: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                region: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/core/util").Region, import("@jbrowse/core/util").Region, import("@jbrowse/core/util").Region>;
                reloadFlag: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
                isLeftEndOfDisplayedRegion: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
                isRightEndOfDisplayedRegion: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            }, {
                stopToken: import("@jbrowse/core/util").StopToken | undefined;
                filled: boolean;
                reactElement: React.ReactElement | undefined;
                features: Map<string, import("@jbrowse/core/util").Feature> | undefined;
                layout: any;
                blockStatusMessage: string;
                error: unknown;
                message: string | undefined;
                maxHeightReached: boolean;
                ReactComponent: ({ model, }: {
                    model: {
                        error?: unknown;
                        reload: () => void;
                        message?: React.ReactNode;
                        statusMessage?: string;
                        reactElement?: React.ReactElement;
                        isRenderingPending?: boolean;
                    };
                }) => import("react/jsx-runtime").JSX.Element;
                renderProps: any;
                renderArgs: Record<string, unknown> | undefined;
                isRenderingPending: boolean;
                cachedDisplay: import("@jbrowse/core/util").AbstractDisplayModel | undefined;
            } & {
                doReload(): void;
                setStatusMessage(message: string): void;
                setLoading(newStopToken: import("@jbrowse/core/util").StopToken): void;
                setMessage(messageText: string): void;
                setRendered(props: import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/models/serverSideRenderedBlock").RenderedProps | undefined): void;
                setError(error: unknown): void;
                reload(): void;
                setCachedDisplay(display: import("@jbrowse/core/util").AbstractDisplayModel): void;
                beforeDestroy(): void;
            } & {
                readonly statusMessage: any;
            } & {
                afterAttach(): void;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            configuration: import("node_modules/@jbrowse/core/src/configuration/configurationSchema.ts").ConfigurationSchemaType<{
                maxFeatureScreenDensity: {
                    type: string;
                    description: string;
                    defaultValue: number;
                };
                fetchSizeLimit: {
                    type: string;
                    defaultValue: number;
                    description: string;
                };
                height: {
                    type: string;
                    defaultValue: number;
                    description: string;
                };
                mouseover: {
                    type: string;
                    description: string;
                    defaultValue: string;
                    contextVariable: string[];
                };
                jexlFilters: {
                    type: string;
                    description: string;
                    defaultValue: never[];
                };
            }, import("node_modules/@jbrowse/core/src/configuration/configurationSchema.ts").ConfigurationSchemaOptions<undefined, "displayId">>;
            showLegend: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
            showTooltips: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
        }, {
            rendererTypeName: string;
            error: unknown;
            statusMessage: string | undefined;
        } & {
            readonly RenderingComponent: React.FC<{
                model: {
                    id: string;
                    type: string;
                    rpcDriverName: string | undefined;
                } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                }, {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                onHorizontalScroll?: () => void;
                blockState?: Record<string, any>;
            }>;
            readonly DisplayBlurb: React.FC<{
                model: {
                    id: string;
                    type: string;
                    rpcDriverName: string | undefined;
                } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                }, {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }> | null;
            readonly adapterConfig: any;
            readonly parentTrack: import("@jbrowse/core/util").AbstractTrackModel;
            readonly isMinimized: boolean;
            readonly parentDisplay: any;
            readonly effectiveRpcDriverName: any;
        } & {
            renderProps(): any;
            renderingProps(): {
                displayModel: {
                    id: string;
                    type: string;
                    rpcDriverName: string | undefined;
                } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                } & {
                    readonly RenderingComponent: React.FC<{
                        model: {
                            id: string;
                            type: string;
                            rpcDriverName: string | undefined;
                        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                        }, {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                        onHorizontalScroll?: () => void;
                        blockState?: Record<string, any>;
                    }>;
                    readonly DisplayBlurb: React.FC<{
                        model: {
                            id: string;
                            type: string;
                            rpcDriverName: string | undefined;
                        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                        }, {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                    }> | null;
                    readonly adapterConfig: any;
                    readonly parentTrack: import("@jbrowse/core/util").AbstractTrackModel;
                    readonly isMinimized: boolean;
                    readonly parentDisplay: any;
                    readonly effectiveRpcDriverName: any;
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                }, {
                    rendererTypeName: string;
                    error: unknown;
                    statusMessage: string | undefined;
                } & {
                    readonly RenderingComponent: React.FC<{
                        model: {
                            id: string;
                            type: string;
                            rpcDriverName: string | undefined;
                        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                        }, {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                        onHorizontalScroll?: () => void;
                        blockState?: Record<string, any>;
                    }>;
                    readonly DisplayBlurb: React.FC<{
                        model: {
                            id: string;
                            type: string;
                            rpcDriverName: string | undefined;
                        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                        }, {
                            rendererTypeName: string;
                            error: unknown;
                            statusMessage: string | undefined;
                        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                    }> | null;
                    readonly adapterConfig: any;
                    readonly parentTrack: import("@jbrowse/core/util").AbstractTrackModel;
                    readonly isMinimized: boolean;
                    readonly parentDisplay: any;
                    readonly effectiveRpcDriverName: any;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            };
            readonly rendererType: import("@jbrowse/core/pluggableElementTypes").RendererType;
            readonly DisplayMessageComponent: undefined | React.FC<any>;
            trackMenuItems(): import("@jbrowse/core/ui").MenuItem[];
            readonly viewMenuActions: import("@jbrowse/core/ui").MenuItem[];
            regionCannotBeRendered(): null;
        } & {
            setStatusMessage(arg?: string): void;
            setError(error?: unknown): void;
            setRpcDriverName(rpcDriverName: string): void;
            reload(): void;
        } & {
            scrollTop: number;
        } & {
            readonly height: number;
        } & {
            setScrollTop(scrollTop: number): void;
            setHeight(displayHeight: number): number;
            resizeHeight(distance: number): number;
        } & {
            featureDensityStatsP: undefined | Promise<import("@jbrowse/core/data_adapters/BaseAdapter").FeatureDensityStats>;
            featureDensityStats: undefined | import("@jbrowse/core/data_adapters/BaseAdapter").FeatureDensityStats;
            currStatsBpPerPx: number;
        } & {
            readonly currentBytesRequested: number;
            readonly currentFeatureScreenDensity: number;
            readonly maxFeatureScreenDensity: any;
            readonly featureDensityStatsReady: boolean;
            readonly maxAllowableBytes: number;
        } & {
            afterAttach(): void;
        } & {
            setCurrStatsBpPerPx(n: number): void;
            setFeatureDensityStatsLimit(stats?: import("@jbrowse/core/data_adapters/BaseAdapter").FeatureDensityStats): void;
            getFeatureDensityStats(): Promise<import("@jbrowse/core/data_adapters/BaseAdapter").FeatureDensityStats>;
            setFeatureDensityStatsP(arg: any): void;
            setFeatureDensityStats(featureDensityStats?: import("@jbrowse/core/data_adapters/BaseAdapter").FeatureDensityStats): void;
            clearFeatureDensityStats(): void;
        } & {
            readonly regionTooLarge: boolean;
            readonly regionTooLargeReason: string;
        } & {
            readonly featureDensityStatsReadyAndRegionNotTooLarge: boolean;
            regionCannotBeRenderedText(_region: import("@jbrowse/core/util").Region): "" | "Force load to see features";
            regionCannotBeRendered(_region: import("@jbrowse/core/util").Region): import("react/jsx-runtime").JSX.Element | null;
        } & {
            mouseoverExtraInformation: string | undefined;
            featureIdUnderMouse: undefined | string;
            subfeatureIdUnderMouse: undefined | string;
            contextMenuFeature: undefined | import("@jbrowse/core/util").Feature;
        } & {
            readonly DisplayMessageComponent: undefined | React.FC<any>;
            readonly blockType: "staticBlocks" | "dynamicBlocks";
            readonly blockDefinitions: import("@jbrowse/core/util/blockTypes").BlockSet;
        } & {
            readonly renderDelay: number;
            readonly TooltipComponent: import("@jbrowse/core/util").AnyReactComponentType;
            legendItems(_theme?: import("@mui/material").Theme): import("@jbrowse/plugin-linear-genome-view").LegendItem[];
            svgLegendWidth(theme?: import("@mui/material").Theme): number;
            readonly selectedFeatureId: string | undefined;
            readonly featureWidgetType: {
                type: string;
                id: string;
            };
        } & {
            readonly showTooltipsEnabled: boolean;
            readonly features: import("@jbrowse/core/util/compositeMap").default<string, import("@jbrowse/core/util").Feature>;
            readonly featureUnderMouse: import("@jbrowse/core/util").Feature | undefined;
            getFeatureById(featureId: string, parentFeatureId?: string): import("@jbrowse/core/util").Feature | undefined;
            readonly layoutFeatures: import("@jbrowse/core/util/compositeMap").default<string, import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/types").LayoutRecord>;
            getFeatureOverlapping(blockKey: string, x: number, y: number): string | undefined;
            getFeatureByID(blockKey: string, id: string): import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/types").LayoutRecord | undefined;
            searchFeatureByID(id: string): import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/types").LayoutRecord | undefined;
            readonly floatingLabelData: Map<string, import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/components/util").FeatureLabelData>;
        } & {
            addBlock(key: string, block: import("@jbrowse/core/util/blockTypes").BaseBlock): void;
            deleteBlock(key: string): void;
            selectFeature(feature: import("@jbrowse/core/util").Feature): void;
            navToFeature(feature: import("@jbrowse/core/util").Feature): void;
            clearFeatureSelection(): void;
            setFeatureIdUnderMouse(feature?: string): void;
            setSubfeatureIdUnderMouse(subfeatureId?: string): void;
            setContextMenuFeature(feature?: import("@jbrowse/core/util").Feature): void;
            setMouseoverExtraInformation(extra?: string): void;
            setShowLegend(s: boolean): void;
            setShowTooltips(arg: boolean): void;
        } & {
            reload(): Promise<void>;
        } & {
            selectFeatureById: (featureId: string, parentFeatureId?: string | undefined, topLevelFeatureId?: string | undefined) => Promise<void>;
            setContextMenuFeatureById: (featureId: string, parentFeatureId?: string | undefined, topLevelFeatureId?: string | undefined) => Promise<void>;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
        onMouseMove(_: unknown, featureId?: string): void;
        onMouseLeave(_: unknown): void;
        onContextMenu(_: unknown): void;
    };
    renderProps(): any;
} & {
    renderSvg(opts: import("@jbrowse/plugin-linear-genome-view").ExportSvgDisplayOptions): Promise<import("react/jsx-runtime").JSX.Element>;
    afterAttach(): void;
} & {
    /**
     * #volatile
     */
    hoveredInfo: Record<string, unknown> | undefined;
    /**
     * #volatile
     */
    prefersOffset: boolean;
    /**
     * #volatile
     */
    volatileSamples: Sample[] | undefined;
    /**
     * #volatile
     */
    volatileTree: NodeWithIds | undefined;
    /**
     * #volatile
     */
    highlightedRowNames: string[] | undefined;
    /**
     * #volatile
     */
    hoveredTreeNode: {
        x: number;
        y: number;
    } | undefined;
    /**
     * #volatile
     */
    treeMenuAnchor: {
        x: number;
        y: number;
        names: string[];
    } | undefined;
} & {
    /**
     * #action
     */
    setHoveredInfo(arg?: Record<string, unknown>): void;
    /**
     * #action
     */
    setRowHeight(n: number): void;
    /**
     * #action
     */
    setRowProportion(n: number): void;
    /**
     * #action
     */
    setShowAllLetters(f: boolean): void;
    /**
     * #action
     */
    setMismatchRendering(f: boolean): void;
    /**
     * #action
     */
    setSamples({ samples, tree, }: {
        samples: Sample[];
        tree: NodeWithIds | undefined;
    }): void;
    /**
     * #action
     */
    setShowAsUpperCase(arg: boolean): void;
    /**
     * #action
     */
    setTreeAreaWidth(width: number): void;
    /**
     * #action
     */
    setShowSidebar(arg: boolean): void;
    /**
     * #action
     */
    setHighlightedRowNames(names?: string[], nodePosition?: {
        x: number;
        y: number;
    }): void;
    /**
     * #action
     */
    setSubtreeFilter(names?: string[]): void;
    /**
     * #action
     */
    setTreeMenuAnchor(anchor?: {
        x: number;
        y: number;
        names: string[];
    }): void;
    /**
     * #action
     */
    showInsertionSequenceDialog(insertionData: {
        sequence: string;
        sampleLabel: string;
        chr: string;
        pos: number;
    }): void;
} & {
    /**
     * #getter
     */
    readonly rendererTypeName: string;
    /**
     * #getter
     */
    readonly rendererConfig: AnyConfigurationModel;
} & {
    /**
     * #getter
     */
    readonly root: HierarchyNode<NodeWithIds> | undefined;
} & {
    /**
     * #getter
     * generates a new tree that is clustered with x,y positions
     */
    readonly hierarchy: HierarchyNode<NodeWithIdsAndLength> | undefined;
    /**
     * #getter
     */
    readonly samples: Sample[] | undefined;
    /**
     * #getter
     */
    readonly totalHeight: number;
    /**
     * #getter
     */
    readonly leaves: HierarchyNode<NodeWithIds>[] | undefined;
    /**
     * #getter
     */
    readonly leafMap: Map<string, HierarchyNode<NodeWithIds>>;
    /**
     * #getter
     * Precomputed map from hierarchy node to its descendant leaf names
     */
    readonly nodeDescendantNames: Map<HierarchyNode<NodeWithIdsAndLength>, string[]>;
    /**
     * #getter
     */
    readonly rowNames: string[] | undefined;
} & {
    /**
     * #getter
     */
    readonly treeWidth: number;
    /**
     * #method
     */
    renderProps(): any;
    /**
     * #method
     */
    trackMenuItems(): (import("@jbrowse/core/ui").MenuDivider | import("@jbrowse/core/ui").MenuSubHeader | import("@jbrowse/core/ui").NormalMenuItem | import("@jbrowse/core/ui").CheckboxMenuItem | import("@jbrowse/core/ui").RadioMenuItem | import("@jbrowse/core/ui").SubMenuItem | {
        label: string;
        type: string;
        subMenu: {
            label: string;
            onClick: () => void;
        }[];
    } | {
        label: string;
        type: string;
        subMenu: {
            label: string;
            type: string;
            checked: boolean;
            onClick: () => void;
        }[];
    })[];
} & {
    /**
     * #getter
     * Get highlight regions from connected MSA views
     */
    readonly msaHighlights: {
        refName: string;
        start: number;
        end: number;
    }[];
    /**
     * #getter
     */
    readonly svgFontSize: number;
    /**
     * #getter
     */
    readonly canDisplayLabel: boolean;
    /**
     * #getter
     */
    readonly labelWidth: number;
    /**
     * #getter
     */
    readonly sidebarWidth: number;
} & {
    afterCreate(): void;
} & {
    /**
     * #action
     */
    renderSvg(opts: ExportSvgDisplayOptions): Promise<import("react").JSX.Element>;
}, {
    [x: string]: any;
} & Partial<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
} & {
    heightPreConfig: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
} & {
    userBpPerPxLimit: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
    userByteSizeLimit: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
} & {
    blockState: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
        key: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        region: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/core/util").Region, import("@jbrowse/core/util").Region, import("@jbrowse/core/util").Region>;
        reloadFlag: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
        isLeftEndOfDisplayedRegion: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        isRightEndOfDisplayedRegion: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    }, {
        stopToken: import("@jbrowse/core/util").StopToken | undefined;
        filled: boolean;
        reactElement: React.ReactElement | undefined;
        features: Map<string, import("@jbrowse/core/util").Feature> | undefined;
        layout: any;
        blockStatusMessage: string;
        error: unknown;
        message: string | undefined;
        maxHeightReached: boolean;
        ReactComponent: ({ model, }: {
            model: {
                error?: unknown;
                reload: () => void;
                message?: React.ReactNode;
                statusMessage?: string;
                reactElement?: React.ReactElement;
                isRenderingPending?: boolean;
            };
        }) => import("react/jsx-runtime").JSX.Element;
        renderProps: any;
        renderArgs: Record<string, unknown> | undefined;
        isRenderingPending: boolean;
        cachedDisplay: import("@jbrowse/core/util").AbstractDisplayModel | undefined;
    } & {
        doReload(): void;
        setStatusMessage(message: string): void;
        setLoading(newStopToken: import("@jbrowse/core/util").StopToken): void;
        setMessage(messageText: string): void;
        setRendered(props: import("@jbrowse/plugin-linear-genome-view/esm/BaseLinearDisplay/models/serverSideRenderedBlock").RenderedProps | undefined): void;
        setError(error: unknown): void;
        reload(): void;
        setCachedDisplay(display: import("@jbrowse/core/util").AbstractDisplayModel): void;
        beforeDestroy(): void;
    } & {
        readonly statusMessage: any;
    } & {
        afterAttach(): void;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    configuration: import("node_modules/@jbrowse/core/src/configuration/configurationSchema.ts").ConfigurationSchemaType<{
        maxFeatureScreenDensity: {
            type: string;
            description: string;
            defaultValue: number;
        };
        fetchSizeLimit: {
            type: string;
            defaultValue: number;
            description: string;
        };
        height: {
            type: string;
            defaultValue: number;
            description: string;
        };
        mouseover: {
            type: string;
            description: string;
            defaultValue: string;
            contextVariable: string[];
        };
        jexlFilters: {
            type: string;
            description: string;
            defaultValue: never[];
        };
    }, import("node_modules/@jbrowse/core/src/configuration/configurationSchema.ts").ConfigurationSchemaOptions<undefined, "displayId">>;
    showLegend: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
    showTooltips: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
}>> & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & import("@jbrowse/mobx-state-tree")._NotCustomized, {
    subtreeFilter?: string[] | undefined;
    showSidebar?: false | undefined;
    showAsUpperCase?: false | undefined;
    treeAreaWidth?: number | undefined;
    showBranchLen?: true | undefined;
    mismatchRendering?: false | undefined;
    showAllLetters?: true | undefined;
    rowProportion?: number | undefined;
    rowHeight?: number | undefined;
    type: "LinearMafDisplay";
    id: string;
    rpcDriverName: string | undefined;
    heightPreConfig: number | undefined;
    userBpPerPxLimit: number | undefined;
    userByteSizeLimit: number | undefined;
    blockState: import("mobx").IKeyValueMap<import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        key: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        region: import("@jbrowse/mobx-state-tree").IType<import("@jbrowse/core/util").Region, import("@jbrowse/core/util").Region, import("@jbrowse/core/util").Region>;
        reloadFlag: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
        isLeftEndOfDisplayedRegion: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        isRightEndOfDisplayedRegion: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    }>>;
    configuration: import("node_modules/@jbrowse/core/src/configuration/configurationSchema.ts").ConfigurationSchemaType<{
        maxFeatureScreenDensity: {
            type: string;
            description: string;
            defaultValue: number;
        };
        fetchSizeLimit: {
            type: string;
            defaultValue: number;
            description: string;
        };
        height: {
            type: string;
            defaultValue: number;
            description: string;
        };
        mouseover: {
            type: string;
            description: string;
            defaultValue: string;
            contextVariable: string[];
        };
        jexlFilters: {
            type: string;
            description: string;
            defaultValue: never[];
        };
    }, import("node_modules/@jbrowse/core/src/configuration/configurationSchema.ts").ConfigurationSchemaOptions<undefined, "displayId">>;
    showLegend: boolean | undefined;
    showTooltips: boolean | undefined;
}>;
export type LinearMafDisplayStateModel = ReturnType<typeof stateModelFactory>;
export type LinearMafDisplayModel = Instance<LinearMafDisplayStateModel>;
