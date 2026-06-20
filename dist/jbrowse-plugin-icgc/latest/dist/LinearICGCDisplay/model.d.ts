/// <reference types="react" />
import { AnyConfigurationSchemaType } from '@jbrowse/core/configuration/configurationSchema';
import PluginManager from '@jbrowse/core/PluginManager';
export declare function stateModelFactory(configSchema: AnyConfigurationSchemaType, pluginManager: PluginManager): import("mobx-state-tree").IModelType<{
    id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("mobx-state-tree").ISimpleType<string>;
    rpcDriverName: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
} & {
    height: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<number>, [undefined]>;
    blockState: import("mobx-state-tree").IMapType<import("mobx-state-tree").IModelType<{
        key: import("mobx-state-tree").ISimpleType<string>;
        region: import("mobx-state-tree").IModelType<{
            refName: import("mobx-state-tree").ISimpleType<string>;
            start: import("mobx-state-tree").ISimpleType<number>;
            end: import("mobx-state-tree").ISimpleType<number>;
            reversed: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<boolean>, [undefined]>;
        } & {
            assemblyName: import("mobx-state-tree").ISimpleType<string>;
        }, {
            setRefName(newRefName: string): void;
        }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>;
        reloadFlag: import("mobx-state-tree").IType<number | undefined, number, number>;
        isLeftEndOfDisplayedRegion: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        isRightEndOfDisplayedRegion: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    }, {
        renderInProgress: AbortController | undefined;
        filled: boolean;
        reactElement: import("react").ReactElement<any, string | ((props: any) => import("react").ReactElement<any, any> | null) | (new (props: any) => import("react").Component<any, any, any>)> | undefined;
        features: Map<string, import("@jbrowse/core/util/simpleFeature").Feature> | undefined;
        layout: any;
        status: string;
        error: unknown;
        message: string | undefined;
        maxHeightReached: boolean;
        ReactComponent: ({ model, }: {
            model: any;
        }) => any;
        renderProps: any;
    } & {
        doReload(): void;
        afterAttach(): void;
        setStatus(message: string): void;
        setLoading(abortController: AbortController): void;
        setMessage(messageText: string): void;
        setRendered(props: {
            reactElement: import("react").ReactElement<any, string | ((props: any) => import("react").ReactElement<any, any> | null) | (new (props: any) => import("react").Component<any, any, any>)>;
            features: Map<string, import("@jbrowse/core/util/simpleFeature").Feature>;
            layout: any;
            maxHeightReached: boolean;
            renderProps: any;
        } | undefined): void;
        setError(error: unknown): void;
        reload(): void;
        beforeDestroy(): void;
    }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>>;
    userBpPerPxLimit: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<number>>;
    userByteSizeLimit: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<number>>;
} & {
    type: import("mobx-state-tree").ISimpleType<"LinearICGCDisplay">;
    configuration: import("mobx-state-tree").ITypeUnion<any, any, any>;
}, {
    rendererTypeName: string;
    error: unknown;
} & {
    readonly RenderingComponent: import("react").FC<{
        model: import("mobx-state-tree").ModelInstanceTypeProps<{
            id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("mobx-state-tree").ISimpleType<string>;
            rpcDriverName: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
        }> & {
            rendererTypeName: string;
            error: unknown;
        } & import("mobx-state-tree").IStateTreeNode<import("mobx-state-tree").IModelType<{
            id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("mobx-state-tree").ISimpleType<string>;
            rpcDriverName: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
        }, {
            rendererTypeName: string;
            error: unknown;
        }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>>;
        onHorizontalScroll?: Function | undefined;
        blockState?: Record<string, any> | undefined;
    }>;
    readonly DisplayBlurb: import("react").FC<{
        model: import("mobx-state-tree").ModelInstanceTypeProps<{
            id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("mobx-state-tree").ISimpleType<string>;
            rpcDriverName: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
        }> & {
            rendererTypeName: string;
            error: unknown;
        } & import("mobx-state-tree").IStateTreeNode<import("mobx-state-tree").IModelType<{
            id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("mobx-state-tree").ISimpleType<string>;
            rpcDriverName: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
        }, {
            rendererTypeName: string;
            error: unknown;
        }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>>;
    }> | null;
    readonly adapterConfig: any;
    readonly parentTrack: any;
    renderProps(): any;
    readonly rendererType: any;
    readonly DisplayMessageComponent: import("react").FC<any> | undefined;
    trackMenuItems(): import("@jbrowse/core/ui").MenuItem[];
    readonly viewMenuActions: import("@jbrowse/core/ui").MenuItem[];
    regionCannotBeRendered(): undefined;
} & {
    setError(error?: unknown): void;
    setRpcDriverName(rpcDriverName: string): void;
    reload(): void;
} & {
    currBpPerPx: number;
    message: string;
    featureIdUnderMouse: string | undefined;
    contextMenuFeature: import("@jbrowse/core/util/simpleFeature").Feature | undefined;
    scrollTop: number;
    estimatedRegionStatsP: Promise<import("@jbrowse/core/data_adapters/BaseAdapter").Stats> | undefined;
    estimatedRegionStats: import("@jbrowse/core/data_adapters/BaseAdapter").Stats | undefined;
} & {
    readonly blockType: "staticBlocks" | "dynamicBlocks";
    readonly blockDefinitions: import("@jbrowse/core/util/blockTypes").BlockSet;
} & {
    readonly renderDelay: number;
    readonly TooltipComponent: import("react").FC<any>;
    readonly selectedFeatureId: string | undefined;
    readonly DisplayMessageComponent: import("react").FC<any> | undefined;
} & {
    readonly features: import("@jbrowse/core/util/compositeMap").default<string, import("@jbrowse/core/util/simpleFeature").Feature>;
    readonly featureUnderMouse: import("@jbrowse/core/util/simpleFeature").Feature | undefined;
    getFeatureOverlapping(blockKey: string, x: number, y: number): any;
    getFeatureByID(blockKey: string, id: string): [number, number, number, number] | undefined;
    searchFeatureByID(id: string): [number, number, number, number] | undefined;
    readonly currentBytesRequested: number;
    readonly currentFeatureScreenDensity: number;
    readonly maxFeatureScreenDensity: any;
    readonly estimatedStatsReady: boolean;
    readonly maxAllowableBytes: number;
} & {
    setMessage(message: string): void;
    afterAttach(): void;
    estimateRegionsStats(regions: import("@jbrowse/core/util").Region[], opts: {
        headers?: Record<string, string> | undefined;
        signal?: AbortSignal | undefined;
        filters?: string[] | undefined;
    }): Promise<import("@jbrowse/core/data_adapters/BaseAdapter").Stats>;
    setRegionStatsP(p?: Promise<import("@jbrowse/core/data_adapters/BaseAdapter").Stats> | undefined): void;
    setRegionStats(estimatedRegionStats?: import("@jbrowse/core/data_adapters/BaseAdapter").Stats | undefined): void;
    clearRegionStats(): void;
    setHeight(displayHeight: number): number;
    resizeHeight(distance: number): number;
    setScrollTop(scrollTop: number): void;
    updateStatsLimit(stats: import("@jbrowse/core/data_adapters/BaseAdapter").Stats): void;
    addBlock(key: string, block: import("@jbrowse/core/util/blockTypes").BaseBlock): void;
    setCurrBpPerPx(n: number): void;
    deleteBlock(key: string): void;
    selectFeature(feature: import("@jbrowse/core/util/simpleFeature").Feature): void;
    clearFeatureSelection(): void;
    setFeatureIdUnderMouse(feature: string | undefined): void;
    reload(): void;
    setContextMenuFeature(feature?: import("@jbrowse/core/util/simpleFeature").Feature | undefined): void;
} & {
    readonly regionTooLarge: boolean;
    readonly regionTooLargeReason: string;
} & {
    reload(): Promise<void>;
    afterAttach(): void;
} & {
    regionCannotBeRenderedText(_region: import("@jbrowse/core/util").Region): "" | "Force load to see features";
    regionCannotBeRendered(_region: import("@jbrowse/core/util").Region): JSX.Element | undefined;
    trackMenuItems(): import("@jbrowse/core/ui").MenuItem[];
    contextMenuItems(): {
        label: string;
        icon: import("@material-ui/core/OverridableComponent").OverridableComponent<import("@material-ui/core").SvgIconTypeMap<{}, "svg">>;
        onClick: () => void;
    }[];
    renderProps(): any;
} & {
    renderSvg(opts: import("@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView").ExportSvgOptions & {
        overrideHeight: number;
    }): Promise<JSX.Element>;
} & {
    openFilterConfig(): void;
    selectFeature(feature: any): void;
} & {
    renderProps(): any;
    readonly rendererTypeName: any;
    trackMenuItems(): (import("@jbrowse/core/ui").MenuDivider | import("@jbrowse/core/ui").MenuSubHeader | import("@jbrowse/core/ui").NormalMenuItem | import("@jbrowse/core/ui").CheckboxMenuItem | import("@jbrowse/core/ui").RadioMenuItem | import("@jbrowse/core/ui").SubMenuItem | {
        label: string;
        onClick: () => void;
        icon: import("@material-ui/core/OverridableComponent").OverridableComponent<import("@material-ui/core").SvgIconTypeMap<{}, "svg">>;
    })[];
}, import("mobx-state-tree")._NotCustomized, {
    id: string;
    type: string;
    rpcDriverName: string | undefined;
    height: number;
    userBpPerPxLimit: number | undefined;
    userByteSizeLimit: number | undefined;
} & import("mobx-state-tree")._NotCustomized>;
