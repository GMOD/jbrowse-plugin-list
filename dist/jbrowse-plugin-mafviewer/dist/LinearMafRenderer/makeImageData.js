import { createJBrowseTheme } from '@jbrowse/core/ui';
import Flatbush from 'flatbush';
import { FONT_CONFIG, processFeatureAlignment, } from './rendering';
import { getCharWidthHeight, getColorBaseMap, getContrastBaseMap } from './util';
/**
 * Initialize the rendering context for streaming feature processing.
 * Call this once before processing features.
 */
export function initRenderingContext(ctx, renderArgs) {
    const { regions, bpPerPx, rowHeight, showAllLetters, theme: configTheme, mismatchRendering, samples, rowProportion, showAsUpperCase, } = renderArgs;
    const region = regions[0];
    const canvasWidth = (region.end - region.start) / bpPerPx;
    const h = rowHeight * rowProportion;
    const theme = createJBrowseTheme(configTheme);
    const colorForBase = getColorBaseMap(theme);
    const contrastForBase = getContrastBaseMap(theme);
    const sampleToRowMap = new Map(samples.map((s, i) => [s.id, i]));
    const scale = 1 / bpPerPx;
    const hp2 = h / 2;
    const offset = (rowHeight - h) / 2;
    const { charWidth, charHeight } = getCharWidthHeight();
    ctx.font = FONT_CONFIG;
    const renderingContext = {
        ctx,
        scale,
        bpPerPx,
        canvasWidth,
        rowHeight,
        h,
        hp2,
        offset,
        colorForBase,
        contrastForBase,
        showAllLetters,
        mismatchRendering,
        showAsUpperCase,
        charWidth,
        charHeight,
        spatialIndex: [],
        spatialIndexCoords: [],
        lastInsertedXPerRow: new Map(),
    };
    return { renderingContext, sampleToRowMap, region };
}
/**
 * Render a single feature to the canvas. Call this for each feature as it streams in.
 */
export function renderFeature(feature, region, bpPerPx, sampleToRowMap, renderingContext) {
    processFeatureAlignment(feature, region, bpPerPx, sampleToRowMap, renderingContext);
}
/**
 * Finalize rendering and build the spatial index.
 * Call this after all features have been processed.
 */
export function finalizeRendering(renderingContext, samples) {
    const flatbush = new Flatbush(renderingContext.spatialIndex.length || 1);
    if (renderingContext.spatialIndex.length === 0) {
        flatbush.add(0, 0, 1, 1);
    }
    else {
        for (let i = 0, l = renderingContext.spatialIndexCoords.length; i < l; i += 4) {
            flatbush.add(renderingContext.spatialIndexCoords[i], renderingContext.spatialIndexCoords[i + 1], renderingContext.spatialIndexCoords[i + 2], renderingContext.spatialIndexCoords[i + 3]);
        }
    }
    flatbush.finish();
    return {
        flatbush: flatbush.data,
        items: renderingContext.spatialIndex,
        samples,
    };
}
/**
 * Original non-streaming version for backward compatibility.
 */
export function makeImageData({ ctx, renderArgs, }) {
    const { features, samples, bpPerPx } = renderArgs;
    const { renderingContext, sampleToRowMap, region } = initRenderingContext(ctx, renderArgs);
    for (const feature of features.values()) {
        renderFeature(feature, region, bpPerPx, sampleToRowMap, renderingContext);
    }
    return finalizeRendering(renderingContext, samples);
}
//# sourceMappingURL=makeImageData.js.map