import type { AnnotationFeature } from '@apollo-annotation/mst';
import type PluginManager from '@jbrowse/core/PluginManager';
import type { AnyConfigurationSchemaType } from '@jbrowse/core/configuration';
import type { ApolloSessionModel } from '../../session';
import type { Layout } from '../glyphs/Glyph';
export declare function layoutsModelFactory(pluginManager: PluginManager, configSchema: AnyConfigurationSchemaType): import("@jbrowse/mobx-state-tree").IModelType<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
} & {
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"LinearApolloDisplay">;
    configuration: AnyConfigurationSchemaType;
    graphical: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    table: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    showCheckResults: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    zoomThreshold: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    heightPreConfig: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
    filteredFeatureTypes: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    loadingState: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
} & {
    cleanupBoundary: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
}, {
    rendererTypeName: string;
    error: unknown;
    statusMessage: string | undefined;
} & {
    readonly RenderingComponent: import("react").FC<{
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
    readonly DisplayBlurb: import("react").FC<{
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
            readonly RenderingComponent: import("react").FC<{
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
            readonly DisplayBlurb: import("react").FC<{
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
            readonly RenderingComponent: import("react").FC<{
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
            readonly DisplayBlurb: import("react").FC<{
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
    readonly DisplayMessageComponent: undefined | import("react").FC<any>;
    trackMenuItems(): import("@jbrowse/core/ui").MenuItem[];
    readonly viewMenuActions: import("@jbrowse/core/ui").MenuItem[];
    regionCannotBeRendered(): null;
} & {
    setStatusMessage(arg?: string): void;
    setError(error?: unknown): void;
    setRpcDriverName(rpcDriverName: string): void;
    reload(): void;
} & {
    renderProps(): any;
} & {
    scrollTop: number;
} & {
    readonly lgv: import("@jbrowse/plugin-linear-genome-view").LinearGenomeViewModel;
    readonly height: number;
    readonly loading: boolean;
    readonly zoomThresholdSetting: number;
} & {
    readonly rendererTypeName: any;
    readonly session: ApolloSessionModel;
    readonly regions: {
        assemblyName: string;
        refName: string;
        start: number;
        end: number;
    }[];
    regionCannotBeRendered(): "Zoom in to see annotations" | undefined;
} & {
    readonly apolloInternetAccount: import("../../ApolloInternetAccount/model").ApolloInternetAccountModel | undefined;
    readonly changeManager: import("../../ChangeManager").ChangeManager;
    getAssemblyId(assemblyName: string): string;
    readonly selectedFeature: AnnotationFeature | undefined;
    readonly hoveredFeature: import("../../session").HoveredFeature | undefined;
} & {
    setScrollTop(scrollTop: number): void;
    setHeight(displayHeight: number): number;
    resizeHeight(distance: number): number;
    showGraphicalOnly(): void;
    showTableOnly(): void;
    showGraphicalAndTable(): void;
    toggleShowCheckResults(): void;
    updateFilteredFeatureTypes(types: string[]): void;
    setLoading(loading: boolean): void;
    setZoomThresholdSetting({ zoomThreshold }: {
        zoomThreshold: number;
    }): void;
} & {
    trackMenuItems(): (import("@jbrowse/core/ui").MenuDivider | import("@jbrowse/core/ui").MenuSubHeader | import("@jbrowse/core/ui").NormalMenuItem | import("@jbrowse/core/ui").CheckboxMenuItem | import("@jbrowse/core/ui").RadioMenuItem | import("@jbrowse/core/ui").SubMenuItem | {
        type: string;
        label: string;
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
        icon?: undefined;
        onClick?: undefined;
    } | {
        label: string;
        icon: typeof import("../../components").Export;
        onClick: () => void;
        type?: undefined;
        subMenu?: undefined;
    } | {
        label: string;
        icon: import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").SvgIconTypeMap<{}, "svg">> & {
            muiName: string;
        };
        onClick: () => void;
        type?: undefined;
        subMenu?: undefined;
    })[];
} & {
    setSelectedFeature(feature?: AnnotationFeature): void;
    setHoveredFeature(hoveredFeature?: import("../../session").HoveredFeature): void;
    showFeatureDetailsWidget(feature: AnnotationFeature, customWidgetNameAndId?: [string, string]): void;
    afterAttach(): void;
} & {
    seenFeatures: import("mobx").ObservableMap<string, AnnotationFeature>;
} & {
    getAnnotationFeatureById(id: string): AnnotationFeature | undefined;
    getGlyph(feature: AnnotationFeature): import("../glyphs/Glyph").Glyph;
} & {
    addSeenFeature(feature: AnnotationFeature): void;
    deleteSeenFeature(featureId: string): void;
} & {
    getCanonicalRefName(assemblyName: string, refSeq: string): string;
} & {
    /**
     * Is a feature in one of the currently displayed regions and also is not
     * currently filtered out by the display.
     */
    isFeatureDisplayed(feature: AnnotationFeature): boolean;
} & {
    readonly layouts: Map<string, Map<string, Layout>>;
    getRowForFeature(feature: AnnotationFeature): number | undefined;
    getFeaturesAtPosition(assemblyName: string, refName: string, row: number, bp: number): AnnotationFeature[];
} & {
    highestRow(assemblyName: string): number;
} & {
    afterAttach(): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
//# sourceMappingURL=layouts.d.ts.map