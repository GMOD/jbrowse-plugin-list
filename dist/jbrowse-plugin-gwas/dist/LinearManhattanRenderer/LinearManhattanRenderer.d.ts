import FeatureRendererType from '@jbrowse/core/pluggableElementTypes/renderers/FeatureRendererType';
import type { AnyConfigurationModel } from '@jbrowse/core/configuration';
import type { RenderArgsDeserialized } from '@jbrowse/core/pluggableElementTypes/renderers/FeatureRendererType';
import type { Feature, Region } from '@jbrowse/core/util';
interface ManhattanRenderProps extends RenderArgsDeserialized {
    features: Map<string, Feature>;
    regions: Region[];
    bpPerPx: number;
    statusCallback?: (arg: string) => void;
    config: AnyConfigurationModel;
    scaleOpts: {
        domain: number[];
        scaleType: string;
        pivotValue?: number;
        inverted?: boolean;
    };
    height: number;
    displayCrossHatches: boolean;
    ticks: {
        values: number[];
    };
    highResolutionScaling?: number;
}
interface ClickMapItem {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    feature: ReturnType<Feature['toJSON']>;
}
export default class ManhattanPlotRenderer extends FeatureRendererType {
    supportsSVG: boolean;
    render(renderProps: ManhattanRenderProps): Promise<{
        features: Map<string, Feature>;
        height: number;
        width: number;
        containsNoTransferables: boolean;
        clickMap: {
            index: ArrayBufferLike;
            items: ClickMapItem[];
        };
        canvasRecordedData: Record<string, unknown>;
        reactElement?: React.ReactElement;
        html?: string;
    } | {
        features: Map<string, Feature>;
        height: number;
        width: number;
        containsNoTransferables: boolean;
        clickMap: {
            index: ArrayBufferLike;
            items: ClickMapItem[];
        };
        imageData: ImageBitmap;
        reactElement?: React.ReactElement;
        html?: string;
    } | {
        features: Map<string, Feature>;
        height: number;
        width: number;
        containsNoTransferables: boolean;
        clickMap: {
            index: ArrayBufferLike;
            items: ClickMapItem[];
        };
        html: string;
        reactElement?: React.ReactElement;
    } | {
        features: Map<string, Feature>;
        height: number;
        width: number;
        containsNoTransferables: boolean;
        clickMap: {
            index: ArrayBufferLike;
            items: ClickMapItem[];
        };
        canvasRecordedData: Record<string, unknown>;
        __rpcResult: true;
        value: unknown;
        transferables: Transferable[];
    } | {
        features: Map<string, Feature>;
        height: number;
        width: number;
        containsNoTransferables: boolean;
        clickMap: {
            index: ArrayBufferLike;
            items: ClickMapItem[];
        };
        imageData: ImageBitmap;
        __rpcResult: true;
        value: unknown;
        transferables: Transferable[];
    } | {
        features: Map<string, Feature>;
        height: number;
        width: number;
        containsNoTransferables: boolean;
        clickMap: {
            index: ArrayBufferLike;
            items: ClickMapItem[];
        };
        html: string;
        __rpcResult: true;
        value: unknown;
        transferables: Transferable[];
    }>;
    draw(ctx: CanvasRenderingContext2D, props: ManhattanRenderProps & {
        features: Map<string, Feature>;
    }): {
        clickMap: {
            index: ArrayBufferLike;
            items: ClickMapItem[];
        };
    };
    drawPoints(ctx: CanvasRenderingContext2D, opts: {
        features: Map<string, Feature>;
        regionStart: number;
        pxPerBp: number;
        toY: (n: number) => number;
        config: AnyConfigurationModel;
        colorValue: string;
        colorCallback: boolean;
        canBatch: boolean;
        stopToken?: string;
    }): ClickMapItem[];
}
export {};
