import { RenderArgsDeserialized } from '@jbrowse/core/pluggableElementTypes/renderers/BoxRendererType';
import { Feature, Region } from '@jbrowse/core/util';
import { RenderingContext } from './rendering';
import type { Sample } from '../types';
interface BaseRenderArgs extends RenderArgsDeserialized {
    samples: Sample[];
    rowHeight: number;
    rowProportion: number;
    showAllLetters: boolean;
    mismatchRendering: boolean;
    statusCallback?: (arg: string) => void;
    showAsUpperCase: boolean;
}
interface RenderArgs extends BaseRenderArgs {
    features: Map<string, Feature>;
}
/**
 * Initialize the rendering context for streaming feature processing.
 * Call this once before processing features.
 */
export declare function initRenderingContext(ctx: CanvasRenderingContext2D, renderArgs: BaseRenderArgs): {
    renderingContext: RenderingContext;
    sampleToRowMap: Map<string, number>;
    region: Region;
};
/**
 * Render a single feature to the canvas. Call this for each feature as it streams in.
 */
export declare function renderFeature(feature: Feature, region: Region, bpPerPx: number, sampleToRowMap: Map<string, number>, renderingContext: RenderingContext): void;
/**
 * Finalize rendering and build the spatial index.
 * Call this after all features have been processed.
 */
export declare function finalizeRendering(renderingContext: RenderingContext, samples: Sample[]): {
    flatbush: ArrayBufferLike;
    items: import("./rendering").RenderedBase[];
    samples: Sample[];
};
/**
 * Original non-streaming version for backward compatibility.
 */
export declare function makeImageData({ ctx, renderArgs, }: {
    ctx: CanvasRenderingContext2D;
    renderArgs: RenderArgs;
}): {
    flatbush: ArrayBufferLike;
    items: import("./rendering").RenderedBase[];
    samples: Sample[];
};
export {};
