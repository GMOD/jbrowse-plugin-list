import type { AnnotationFeature } from '@apollo-annotation/mst';
import type PluginManager from '@jbrowse/core/PluginManager';
import { type AnyConfigurationSchemaType } from '@jbrowse/core/configuration';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
import type { ApolloInternetAccountModel } from '../../ApolloInternetAccount/model';
import type { ApolloSessionModel, HoveredFeature } from '../../session';
export declare function baseModelFactory(_pluginManager: PluginManager, configSchema: AnyConfigurationSchemaType): import("@jbrowse/mobx-state-tree").IModelType<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    rpcDriverName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
} & {
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"LinearApolloReferenceSequenceDisplay">;
    configuration: AnyConfigurationSchemaType;
    showStartCodons: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    showStopCodons: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    highContrast: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    heightPreConfig: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
    sequenceRowHeight: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
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
    readonly lgv: LinearGenomeViewModel;
} & {
    readonly rendererTypeName: any;
    readonly session: ApolloSessionModel;
    readonly regions: {
        assemblyName: string;
        refName: string;
        start: number;
        end: number;
    }[];
    regionCannotBeRendered(): "Zoom in to see sequence" | undefined;
} & {
    readonly expandedRegions: {
        assemblyName: string;
        refName: string;
        start: number;
        end: number;
    }[];
    readonly apolloInternetAccount: ApolloInternetAccountModel | undefined;
    readonly changeManager: import("../../ChangeManager").ChangeManager;
    getAssemblyId(assemblyName: string): string;
    readonly selectedFeature: AnnotationFeature | undefined;
    readonly hoveredFeature: HoveredFeature | undefined;
    readonly height: number;
} & {
    scrollTop: number;
} & {
    setScrollTop(scrollTop: number): void;
    setHeight(displayHeight: number): number;
    resizeHeight(distance: number): number;
    toggleShowStartCodons(): void;
    toggleShowStopCodons(): void;
    toggleHighContrast(): void;
} & {
    trackMenuItems(): (import("@jbrowse/core/ui").MenuDivider | import("@jbrowse/core/ui").MenuSubHeader | import("@jbrowse/core/ui").NormalMenuItem | import("@jbrowse/core/ui").CheckboxMenuItem | import("@jbrowse/core/ui").RadioMenuItem | import("@jbrowse/core/ui").SubMenuItem | {
        type: string;
        label: string;
        subMenu: {
            label: string;
            type: string;
            checked: boolean;
            onClick: () => void;
        }[];
    })[];
} & {
    afterAttach(): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
//# sourceMappingURL=base.d.ts.map