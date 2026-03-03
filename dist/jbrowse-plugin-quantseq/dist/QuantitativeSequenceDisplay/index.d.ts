/// <reference types="react" />
import PluginManager from '@jbrowse/core/PluginManager';
export declare function configSchemaFactory(pluginManager: PluginManager): import("@jbrowse/core/configuration/configurationSchema").AnyConfigurationSchemaType;
export declare function stateModelFactory(pluginManager: PluginManager, configSchema: any): import("mobx-state-tree").IModelType<{
    id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("mobx-state-tree").ISimpleType<string>;
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
        isLeftEndOfDisplayedRegion: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
        isRightEndOfDisplayedRegion: import("mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    }, {
        renderInProgress: AbortController | undefined;
        filled: boolean;
        data: any;
        html: string;
        status: string;
        error: Error | undefined;
        message: string | undefined;
        maxHeightReached: boolean;
        ReactComponent: ({ model, }: {
            model: any;
        }) => JSX.Element;
        renderingComponent: any;
        renderProps: any;
    } & {
        afterAttach(): void;
        setStatus(message: string): void;
        setLoading(abortController: AbortController): void;
        setMessage(messageText: string): void;
        setRendered(props: {
            data: any;
            html: any;
            maxHeightReached: boolean;
            renderingComponent: import("react").Component<{}, {}, any>;
            renderProps: any;
        } | undefined): void;
        setError(error: Error): void;
        reload(): void;
        beforeDestroy(): void;
    }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>>;
    userBpPerPxLimit: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<number>>;
} & {
    type: import("mobx-state-tree").ISimpleType<"LinearWiggleDisplay">;
    configuration: import("mobx-state-tree").ITypeUnion<any, any, any>;
    selectedRendering: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
    resolution: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<number>, [undefined]>;
    fill: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<boolean>>;
    color: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
    summaryScoreMode: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
    rendererTypeNameState: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
    scale: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
    autoscale: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
    displayCrossHatches: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<boolean>>;
    constraints: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").IModelType<{
        max: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<number>>;
        min: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<number>>;
    }, {}, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>, [undefined]>;
} & {
    type: import("mobx-state-tree").ISimpleType<"QuantitativeSequenceDisplay">;
}, {
    rendererTypeName: string;
    error: Error | undefined;
} & {
    readonly RenderingComponent: import("react").FC<{
        model: import("mobx-state-tree").ModelInstanceTypeProps<{
            id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("mobx-state-tree").ISimpleType<string>;
        }> & {
            rendererTypeName: string;
            error: Error | undefined;
        } & import("mobx-state-tree").IStateTreeNode<import("mobx-state-tree").IModelType<{
            id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("mobx-state-tree").ISimpleType<string>;
        }, {
            rendererTypeName: string;
            error: Error | undefined;
        }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>>;
        onHorizontalScroll?: Function | undefined;
        blockState?: Record<string, any> | undefined;
    }>;
    readonly DisplayBlurb: import("react").FC<{
        model: import("mobx-state-tree").ModelInstanceTypeProps<{
            id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("mobx-state-tree").ISimpleType<string>;
        }> & {
            rendererTypeName: string;
            error: Error | undefined;
        } & import("mobx-state-tree").IStateTreeNode<import("mobx-state-tree").IModelType<{
            id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("mobx-state-tree").ISimpleType<string>;
        }, {
            rendererTypeName: string;
            error: Error | undefined;
        }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>>;
    }> | null;
    readonly adapterConfig: any;
    readonly parentTrack: any;
    readonly renderProps: any;
    readonly rendererType: import("@jbrowse/core/pluggableElementTypes/renderers/RendererType").default;
    readonly DisplayMessageComponent: import("react").FC<any> | undefined;
    readonly trackMenuItems: import("@jbrowse/core/ui").MenuItem[];
    readonly viewMenuActions: import("@jbrowse/core/ui").MenuItem[];
    regionCannotBeRendered(): undefined;
} & {
    setError(error?: Error | undefined): void;
    reload(): void;
} & {
    message: string;
    featureIdUnderMouse: string | undefined;
    contextMenuFeature: import("@jbrowse/core/util/simpleFeature").Feature | undefined;
    additionalContextMenuItemCallbacks: Function[];
    scrollTop: number;
} & {
    readonly maxViewBpPerPx: any;
    readonly blockType: "staticBlocks" | "dynamicBlocks";
    readonly renderDelay: number;
    readonly TooltipComponent: import("react").FC<any>;
    readonly blockDefinitions: import("@jbrowse/core/util/blockTypes").BlockSet;
    readonly selectedFeatureId: string | undefined;
    readonly DisplayMessageComponent: import("react").FC<any> | undefined;
} & {
    readonly features: import("@jbrowse/core/util/compositeMap").default<string, import("@jbrowse/core/util/simpleFeature").Feature>;
    readonly featureUnderMouse: import("@jbrowse/core/util/simpleFeature").Feature | undefined;
    readonly blockLayoutFeatures: Map<string, Map<string, [number, number, number, number]>>;
    readonly layoutFeatures: import("@jbrowse/core/util/compositeMap").default<string, [number, number, number, number]>;
    readonly rtree: Record<string, any>;
    getFeatureOverlapping(blockKey: string, x: number, y: number): import("@jbrowse/plugin-linear-genome-view/dist/BaseLinearDisplay/models/BaseLinearDisplayModel").Layout[];
} & {
    afterAttach(): void;
    setHeight(displayHeight: number): number;
    resizeHeight(distance: number): number;
    setScrollTop(scrollTop: number): void;
    setUserBpPerPxLimit(limit: number): void;
    setMessage(message: string): void;
    addBlock(key: string, block: import("@jbrowse/core/util/blockTypes").BaseBlock): void;
    deleteBlock(key: string): void;
    selectFeature(feature: import("@jbrowse/core/util/simpleFeature").Feature): void;
    clearFeatureSelection(): void;
    setFeatureIdUnderMouse(feature: string | undefined): void;
    reload(): void;
    addAdditionalContextMenuItemCallback(callback: Function): void;
    setContextMenuFeature(feature?: import("@jbrowse/core/util/simpleFeature").Feature | undefined): void;
} & {
    regionCannotBeRendered(): JSX.Element | undefined;
    readonly trackMenuItems: import("@jbrowse/core/ui").MenuItem[];
    readonly composedTrackMenuItems: import("@jbrowse/core/ui").MenuItem[];
    readonly contextMenuItems: {
        label: string;
        icon: import("@material-ui/core/OverridableComponent").OverridableComponent<import("@material-ui/core").SvgIconTypeMap<{}, "svg">>;
        onClick: () => void;
    }[];
    readonly composedRenderProps: any;
    readonly renderProps: any;
} & {
    ready: boolean;
    message: string | undefined;
    stats: {
        scoreMin: number;
        scoreMax: number;
    } & import("mobx").IObservableObject;
    statsFetchInProgress: AbortController | undefined;
} & {
    updateStats(stats: {
        scoreMin: number;
        scoreMax: number;
    }): void;
    setColor(color: string): void;
    setLoading(aborter: AbortController): void;
    selectFeature(feature: import("@jbrowse/core/util/simpleFeature").Feature): void;
    setResolution(res: number): void;
    setFill(fill: boolean): void;
    toggleLogScale(): void;
    setSummaryScoreMode(val: string): void;
    setAutoscale(val: string): void;
    setMaxScore(val?: number | undefined): void;
    setRendererType(val: string): void;
    setMinScore(val?: number | undefined): void;
    toggleCrossHatches(): void;
} & {
    readonly TooltipComponent: import("react").FC<{}>;
    readonly adapterTypeName: any;
    readonly rendererTypeName: string;
    readonly filters: undefined;
    readonly scaleType: any;
    readonly filled: any;
    readonly maxScore: any;
    readonly minScore: any;
    readonly rendererConfig: import("mobx-state-tree").ModelInstanceTypeProps<Record<string, any>> & {
        setSubschema(slotName: string, data: import("@jbrowse/core/configuration/configurationSchema").AnyConfigurationSchemaType | import("mobx-state-tree").ModelPropertiesDeclaration): any;
    } & import("mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration/configurationSchema").AnyConfigurationSchemaType>;
} & {
    readonly summaryScoreModeSetting: any;
    readonly domain: number[];
    readonly needsScalebar: boolean;
    readonly scaleOpts: {
        domain: number[];
        stats: {
            scoreMin: number;
            scoreMax: number;
        } & import("mobx").IObservableObject;
        autoscaleType: any;
        scaleType: any;
        inverted: any;
    };
    readonly canHaveFill: boolean;
    readonly autoscaleType: any;
    readonly displayCrossHatchesSetting: any;
} & {
    readonly ticks: any;
    readonly renderProps: any;
    readonly hasResolution: any;
    readonly hasGlobalStats: any;
    readonly composedTrackMenuItems: ({
        label: string;
        subMenu: {
            label: string;
            onClick: () => void;
        }[];
        onClick?: undefined;
        type?: undefined;
        checked?: undefined;
    } | {
        label: string;
        onClick: () => void;
        subMenu?: undefined;
        type?: undefined;
        checked?: undefined;
    } | {
        type: string;
        label: string;
        checked: any;
        onClick: () => void;
        subMenu?: undefined;
    })[];
    readonly trackMenuItems: (import("@jbrowse/core/ui").MenuDivider | import("@jbrowse/core/ui").MenuSubHeader | import("@jbrowse/core/ui").NormalMenuItem | import("@jbrowse/core/ui").CheckboxMenuItem | import("@jbrowse/core/ui").RadioMenuItem | import("@jbrowse/core/ui").SubMenuItem | {
        label: string;
        subMenu: {
            label: string;
            onClick: () => void;
        }[];
        onClick?: undefined;
        type?: undefined;
        checked?: undefined;
    } | {
        label: string;
        onClick: () => void;
        subMenu?: undefined;
        type?: undefined;
        checked?: undefined;
    } | {
        type: string;
        label: string;
        checked: any;
        onClick: () => void;
        subMenu?: undefined;
    })[];
} & {
    reload(): Promise<void>;
    afterAttach(): void;
} & {
    readonly rendererTypeName: string;
    readonly needsScalebar: boolean;
}, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>;
export declare type QuantitativeSequenceDisplayModel = ReturnType<typeof stateModelFactory>;
