import type PluginManager from '@jbrowse/core/PluginManager';
import type { AnyConfigurationSchemaType } from '@jbrowse/core/configuration';
import { type Instance } from '@jbrowse/mobx-state-tree';
import { type Theme } from '@mui/material';
import type { ApolloSessionModel } from '../../session';
export declare function renderingModelFactory(pluginManager: PluginManager, configSchema: AnyConfigurationSchemaType): import("@jbrowse/mobx-state-tree").IModelType<{
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
} & {
    apolloRowHeight: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    detailsMinHeight: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    detailsHeight: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    isShown: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    filteredTranscripts: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
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
    readonly selectedFeature: import("@apollo-annotation/mst").AnnotationFeature | undefined;
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
    setSelectedFeature(feature?: import("@apollo-annotation/mst").AnnotationFeature): void;
    setHoveredFeature(hoveredFeature?: import("../../session").HoveredFeature): void;
    showFeatureDetailsWidget(feature: import("@apollo-annotation/mst").AnnotationFeature, customWidgetNameAndId?: [string, string]): void;
    afterAttach(): void;
} & {
    seenFeatures: import("mobx").ObservableMap<string, import("@apollo-annotation/mst").AnnotationFeature>;
} & {
    getAnnotationFeatureById(id: string): import("@apollo-annotation/mst").AnnotationFeature | undefined;
    getGlyph(feature: import("@apollo-annotation/mst").AnnotationFeature): import("../glyphs/Glyph").Glyph;
} & {
    addSeenFeature(feature: import("@apollo-annotation/mst").AnnotationFeature): void;
    deleteSeenFeature(featureId: string): void;
} & {
    getCanonicalRefName(assemblyName: string, refSeq: string): string;
} & {
    isFeatureDisplayed(feature: import("@apollo-annotation/mst").AnnotationFeature): boolean;
} & {
    readonly layouts: Map<string, Map<string, import("../glyphs/Glyph").Layout>>;
    getRowForFeature(feature: import("@apollo-annotation/mst").AnnotationFeature): number | undefined;
    getFeaturesAtPosition(assemblyName: string, refName: string, row: number, bp: number): import("@apollo-annotation/mst").AnnotationFeature[];
} & {
    highestRow(assemblyName: string): number;
} & {
    afterAttach(): void;
} & {
    canvas: HTMLCanvasElement | null;
    overlayCanvas: HTMLCanvasElement | null;
    collaboratorCanvas: HTMLCanvasElement | null;
    theme: Theme;
} & {
    featuresHeight(assemblyName: string): number;
    readonly canvasPatterns: Record<"forward" | "backward", CanvasPattern | null>;
} & {
    toggleShown(): void;
    setDetailsHeight(newHeight: number): void;
    setCanvas(canvas: HTMLCanvasElement | null): void;
    setOverlayCanvas(canvas: HTMLCanvasElement | null): void;
    setCollaboratorCanvas(canvas: HTMLCanvasElement | null): void;
    setTheme(theme: Theme): void;
} & {
    afterAttach(): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
export type LinearApolloDisplayRenderingModel = ReturnType<typeof renderingModelFactory>;
export interface LinearApolloDisplayRendering extends Instance<LinearApolloDisplayRenderingModel> {
}
//# sourceMappingURL=rendering.d.ts.map