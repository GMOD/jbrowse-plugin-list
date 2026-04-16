import type PluginManager from '@jbrowse/core/PluginManager';
import type { AnyConfigurationSchemaType } from '@jbrowse/core/configuration';
import type { Feature } from '@jbrowse/core/util';
export declare function stateModelFactory(pluginManager: PluginManager, configSchema: AnyConfigurationSchemaType): import("@jbrowse/mobx-state-tree").IModelType<{
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
                displayHeight?: number;
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
        setRendered(props: import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/models/serverSideRenderedBlock.ts").RenderedProps | undefined): void;
        setError(error: unknown): void;
        reload(): void;
        setCachedDisplay(display: import("@jbrowse/core/util").AbstractDisplayModel): void;
        beforeDestroy(): void;
    } & {
        readonly statusMessage: any;
        readonly displayHeight: number | undefined;
    } & {
        afterAttach(): void;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    configuration: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
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
    }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "displayId">>;
    showLegend: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
    showTooltips: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
} & {
    selectedRendering: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    resolution: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    fill: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
    minSize: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
    color: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    posColor: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    negColor: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    summaryScoreMode: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    rendererTypeNameState: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    scale: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    autoscale: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    displayCrossHatches: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
    constraints: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IModelType<{
        max: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
        min: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>, [undefined]>;
    configuration: AnyConfigurationSchemaType;
} & {
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"LinearWiggleDisplay">;
    invertedSetting: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
} & {
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"LinearManhattanDisplay">;
    /**
     * #property
     */
    configuration: AnyConfigurationSchemaType;
    /**
     * #property
     */
    jexlFilters: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
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
    readonly layoutFeatures: import("@jbrowse/core/util/compositeMap").default<string, import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/types.ts").LayoutRecord>;
    getFeatureOverlapping(blockKey: string, x: number, y: number): string | undefined;
    getFeatureByID(blockKey: string, id: string): import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/types.ts").LayoutRecord | undefined;
    searchFeatureByID(id: string): import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/types.ts").LayoutRecord | undefined;
    readonly floatingLabelData: Map<string, import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/components/util.ts").FeatureLabelData>;
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
                        displayHeight?: number;
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
                setRendered(props: import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/models/serverSideRenderedBlock.ts").RenderedProps | undefined): void;
                setError(error: unknown): void;
                reload(): void;
                setCachedDisplay(display: import("@jbrowse/core/util").AbstractDisplayModel): void;
                beforeDestroy(): void;
            } & {
                readonly statusMessage: any;
                readonly displayHeight: number | undefined;
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
                        displayHeight?: number;
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
                setRendered(props: import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/models/serverSideRenderedBlock.ts").RenderedProps | undefined): void;
                setError(error: unknown): void;
                reload(): void;
                setCachedDisplay(display: import("@jbrowse/core/util").AbstractDisplayModel): void;
                beforeDestroy(): void;
            } & {
                readonly statusMessage: any;
                readonly displayHeight: number | undefined;
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
                    } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & any & import("@jbrowse/mobx-state-tree").IStateTreeNode<AnyConfigurationSchemaType>);
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<AnyConfigurationSchemaType>);
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
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
            }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "displayId">>>;
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
            readonly layoutFeatures: import("@jbrowse/core/util/compositeMap").default<string, import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/types.ts").LayoutRecord>;
            getFeatureOverlapping(blockKey: string, x: number, y: number): string | undefined;
            getFeatureByID(blockKey: string, id: string): import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/types.ts").LayoutRecord | undefined;
            searchFeatureByID(id: string): import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/types.ts").LayoutRecord | undefined;
            readonly floatingLabelData: Map<string, import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/components/util.ts").FeatureLabelData>;
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
                        displayHeight?: number;
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
                setRendered(props: import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/models/serverSideRenderedBlock.ts").RenderedProps | undefined): void;
                setError(error: unknown): void;
                reload(): void;
                setCachedDisplay(display: import("@jbrowse/core/util").AbstractDisplayModel): void;
                beforeDestroy(): void;
            } & {
                readonly statusMessage: any;
                readonly displayHeight: number | undefined;
            } & {
                afterAttach(): void;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            configuration: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
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
            }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "displayId">>;
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
            readonly layoutFeatures: import("@jbrowse/core/util/compositeMap").default<string, import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/types.ts").LayoutRecord>;
            getFeatureOverlapping(blockKey: string, x: number, y: number): string | undefined;
            getFeatureByID(blockKey: string, id: string): import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/types.ts").LayoutRecord | undefined;
            searchFeatureByID(id: string): import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/types.ts").LayoutRecord | undefined;
            readonly floatingLabelData: Map<string, import("@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/components/util.ts").FeatureLabelData>;
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
    message: undefined | string;
    stats: {
        currStatsBpPerPx: number;
        scoreMin: number;
        scoreMax: number;
        scoreMeanMin?: number;
        scoreMeanMax?: number;
        statsRegion?: string;
    } | undefined;
    statsFetchInProgress: undefined | import("@jbrowse/core/util").StopToken;
} & {
    updateQuantitativeStats(stats: {
        currStatsBpPerPx: number;
        scoreMin: number;
        scoreMax: number;
        scoreMeanMin?: number;
        scoreMeanMax?: number;
    }, statsRegion?: string): void;
    setColor(color?: string): void;
    setPosColor(color?: string): void;
    setNegColor(color?: string): void;
    setStatsLoading(arg?: import("@jbrowse/core/util").StopToken): void;
    selectFeature(feature: import("@jbrowse/core/util").Feature): void;
    setResolution(res: number): void;
    setFill(fill: number): void;
    toggleLogScale(): void;
    setScaleType(scale?: string): void;
    setSummaryScoreMode(val: string): void;
    setAutoscale(val: string): void;
    setMaxScore(val?: number): void;
    setRendererType(val: string): void;
    setMinScore(val?: number): void;
    toggleCrossHatches(): void;
    setCrossHatches(cross: boolean): void;
} & {
    readonly adapterTypeName: any;
    readonly rendererTypeNameSimple: string;
    readonly filters: undefined;
    readonly scaleType: string;
    readonly maxScore: number;
    readonly minScore: number;
} & {
    readonly adapterCapabilities: string[];
    readonly rendererConfig: {
        scaleType: string;
        filled: any;
        displayCrossHatches: any;
        summaryScoreMode: any;
        color: any;
        negColor: any;
        posColor: any;
        minSize: any;
    };
    readonly autoscaleType: string;
} & {
    readonly domain: number[] | undefined;
} & {
    readonly filled: any;
    readonly summaryScoreModeSetting: any;
    readonly scaleOpts: {
        domain: number[] | undefined;
        stats: {
            currStatsBpPerPx: number;
            scoreMin: number;
            scoreMax: number;
            scoreMeanMin?: number;
            scoreMeanMax?: number;
            statsRegion?: string;
        } | undefined;
        autoscaleType: string;
        scaleType: string;
        inverted: boolean;
    };
    readonly canHaveFill: boolean;
    readonly displayCrossHatchesSetting: any;
    readonly hasResolution: boolean;
    readonly hasGlobalStats: boolean;
} & {
    scoreTrackMenuItems(): ({
        label: string;
        subMenu: {
            label: string;
            onClick: () => void;
        }[];
        onClick?: undefined;
    } | {
        label: string;
        subMenu: {
            label: string;
            type: string;
            checked: boolean;
            onClick: () => void;
        }[];
        onClick?: undefined;
    } | {
        label: string;
        onClick: () => void;
        subMenu?: undefined;
    })[];
} & {
    reload(): Promise<void>;
} & {
    setInverted(arg: boolean): void;
} & {
    readonly TooltipComponent: import("@jbrowse/core/util").AnyReactComponentType;
    readonly rendererTypeName: string;
    readonly quantitativeStatsRelevantToCurrentZoom: boolean;
    readonly graphType: boolean;
    readonly inverted: boolean;
} & {
    adapterProps(): any;
    readonly ticks: {
        range: number[];
        values: number[];
        format: (d: import("d3-scale").NumberValue) => string;
        position: import("d3-scale").ScaleLinear<number, number, never> | import("d3-scale").ScaleQuantize<number, never>;
    } | undefined;
} & {
    renderProps(): any;
    readonly fillSetting: 0 | 1 | 2;
    readonly quantitativeStatsReady: boolean;
} & {
    wiggleBaseTrackMenuItems(): (import("@jbrowse/core/ui").MenuDivider | import("@jbrowse/core/ui").MenuSubHeader | import("@jbrowse/core/ui").NormalMenuItem | import("@jbrowse/core/ui").CheckboxMenuItem | import("@jbrowse/core/ui").RadioMenuItem | import("@jbrowse/core/ui").SubMenuItem | {
        label: string;
        icon: import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").SvgIconTypeMap<{}, "svg">> & {
            muiName: string;
        };
        subMenu: ({
            label: string;
            subMenu: {
                label: string;
                onClick: () => void;
            }[];
            onClick?: undefined;
        } | {
            label: string;
            subMenu: {
                label: string;
                type: string;
                checked: boolean;
                onClick: () => void;
            }[];
            onClick?: undefined;
        } | {
            label: string;
            onClick: () => void;
            subMenu?: undefined;
        })[];
    })[];
    wiggleOnlyTrackMenuItems(): ({
        label: string;
        subMenu: {
            label: string;
            type: string;
            checked: boolean;
            onClick: () => void;
        }[];
        icon?: undefined;
        onClick?: undefined;
    } | {
        label: string;
        icon: import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").SvgIconTypeMap<{}, "svg">> & {
            muiName: string;
        };
        onClick: () => void;
        subMenu?: undefined;
    })[];
} & {
    trackMenuItems(): (import("@jbrowse/core/ui").MenuDivider | import("@jbrowse/core/ui").MenuSubHeader | import("@jbrowse/core/ui").NormalMenuItem | import("@jbrowse/core/ui").CheckboxMenuItem | import("@jbrowse/core/ui").RadioMenuItem | import("@jbrowse/core/ui").SubMenuItem | {
        label: string;
        icon: import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").SvgIconTypeMap<{}, "svg">> & {
            muiName: string;
        };
        subMenu: ({
            label: string;
            subMenu: {
                label: string;
                onClick: () => void;
            }[];
            onClick?: undefined;
        } | {
            label: string;
            subMenu: {
                label: string;
                type: string;
                checked: boolean;
                onClick: () => void;
            }[];
            onClick?: undefined;
        } | {
            label: string;
            onClick: () => void;
            subMenu?: undefined;
        })[];
    } | {
        label: string;
        subMenu: {
            label: string;
            type: string;
            checked: boolean;
            onClick: () => void;
        }[];
        icon?: undefined;
        onClick?: undefined;
    } | {
        label: string;
        icon: import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").SvgIconTypeMap<{}, "svg">> & {
            muiName: string;
        };
        onClick: () => void;
        subMenu?: undefined;
    } | {
        label: string;
        icon: import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").SvgIconTypeMap<{}, "svg">> & {
            muiName: string;
        };
        subMenu: {
            label: string;
            type: string;
            checked: any;
            onClick: () => void;
        }[];
    })[];
} & {
    afterAttach(): void;
    renderSvg(opts: import("@jbrowse/plugin-linear-genome-view").ExportSvgDisplayOptions): Promise<import("react/jsx-runtime").JSX.Element>;
} & {
    /**
     * #getter
     */
    readonly TooltipComponent: (props: {
        model: import("./components/TooltipComponent").Model;
        height: number;
        offsetMouseCoord: [number, number];
        clientMouseCoord: [number, number];
        clientRect?: DOMRect;
    }) => import("react").JSX.Element;
    /**
     * #getter
     */
    readonly rendererTypeName: string;
    /**
     * #getter
     */
    readonly needsScalebar: boolean;
    /**
     * #getter
     */
    readonly regionTooLarge: boolean;
    /**
     * #getter
     * config jexlFilters are deferred evaluated so they are prepended with
     * jexl at runtime rather than being stored with jexl in the config
     */
    readonly activeFilters: any;
} & {
    /**
     * #action
     * this overrides the BaseLinearDisplayModel to avoid popping up a
     * feature detail display, but still sets the feature selection on the
     * model so listeners can detect a click
     */
    selectFeature(feature: Feature): void;
    /**
     * #action
     */
    setJexlFilters(f?: string[]): void;
} & {
    /**
     * #method
     */
    renderProps(): any;
    /**
     * #method
     */
    trackMenuItems(): import("@jbrowse/core/ui").MenuItem[];
}, import("@jbrowse/mobx-state-tree")._NotCustomized, {
    id: string;
    type: "LinearWiggleDisplay";
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
    configuration: import("@jbrowse/mobx-state-tree").ModelSnapshotType<Record<string, any>>;
    showLegend: boolean | undefined;
    showTooltips: boolean | undefined;
    selectedRendering: string;
    resolution: number;
    fill: boolean | undefined;
    minSize: number | undefined;
    color: string | undefined;
    posColor: string | undefined;
    negColor: string | undefined;
    summaryScoreMode: string | undefined;
    rendererTypeNameState: string | undefined;
    scale: string | undefined;
    autoscale: string | undefined;
    displayCrossHatches: boolean | undefined;
    constraints: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        max: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
        min: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
    }>;
    invertedSetting: boolean | undefined;
} & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & import("@jbrowse/mobx-state-tree")._NotCustomized>;
export type LinearManhattanDisplayModel = ReturnType<typeof stateModelFactory>;
