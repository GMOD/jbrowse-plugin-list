import { readConfObject } from '@jbrowse/core/configuration';
import FeatureRendererType from '@jbrowse/core/pluggableElementTypes/renderers/FeatureRendererType';
import { renderToAbstractCanvas, updateStatus } from '@jbrowse/core/util';
import { getScale } from '@jbrowse/plugin-wiggle';
import Flatbush from 'flatbush';
import { checkStopToken } from './util';
const TWO_PI = Math.PI * 2;
const YSCALEBAR_LABEL_OFFSET = 5;
const POINT_RADIUS = 2;
export default class ManhattanPlotRenderer extends FeatureRendererType {
    constructor() {
        super(...arguments);
        this.supportsSVG = true;
    }
    async render(renderProps) {
        const features = await this.getFeatures(renderProps);
        const { height, regions, bpPerPx, statusCallback = () => { } } = renderProps;
        const region = regions[0];
        const width = (region.end - region.start) / bpPerPx;
        const rest = await updateStatus('Rendering plot', statusCallback, () => renderToAbstractCanvas(width, height, renderProps, ctx => this.draw(ctx, {
            ...renderProps,
            features,
        })));
        const results = await super.render({
            ...renderProps,
            ...rest,
            features,
            height,
            width,
        });
        return {
            ...results,
            ...rest,
            features,
            height,
            width,
            containsNoTransferables: true,
        };
    }
    draw(ctx, props) {
        const { features, regions, bpPerPx, config, scaleOpts, height: unadjustedHeight, displayCrossHatches, ticks: { values }, stopToken, } = props;
        const region = regions[0];
        const height = unadjustedHeight - YSCALEBAR_LABEL_OFFSET * 2;
        const width = (region.end - region.start) / bpPerPx;
        const pxPerBp = 1 / bpPerPx;
        const regionStart = region.start;
        const scale = getScale({
            ...scaleOpts,
            range: [0, height],
        });
        const toY = (n) => height + YSCALEBAR_LABEL_OFFSET - scale(n);
        const colorCallback = config.color.isCallback;
        const colorValue = config.color.value;
        // Batched drawing (single beginPath/fill) is faster but doesn't work with
        // alpha blending since overlapping circles would blend incorrectly
        const canBatch = !colorCallback &&
            !colorValue.includes('rgba') &&
            !colorValue.includes('hsla');
        const items = this.drawPoints(ctx, {
            features,
            regionStart,
            pxPerBp,
            toY,
            config,
            colorValue,
            colorCallback,
            canBatch,
            stopToken,
        });
        if (displayCrossHatches) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(200,200,200,0.8)';
            ctx.beginPath();
            for (const tick of values) {
                const y = Math.round(toY(tick));
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();
        }
        const index = new Flatbush(Math.max(items.length, 1));
        if (items.length === 0) {
            index.add(0, 0, 0, 0);
        }
        else {
            for (const item of items) {
                index.add(item.minX, item.minY, item.maxX, item.maxY);
            }
        }
        index.finish();
        return { clickMap: { index: index.data, items } };
    }
    drawPoints(ctx, opts) {
        const { features, regionStart, pxPerBp, toY, config, colorValue, colorCallback, canBatch, stopToken, } = opts;
        const items = [];
        let lastX = 0;
        let lastY = 0;
        let checkTime = performance.now();
        let i = 0;
        const addPoint = (feature, x, y) => {
            if (Math.abs(x - lastX) > 1 || Math.abs(y - lastY) > 1) {
                lastX = x;
                lastY = y;
                items.push({
                    minX: x - POINT_RADIUS,
                    minY: y - POINT_RADIUS,
                    maxX: x + POINT_RADIUS,
                    maxY: y + POINT_RADIUS,
                    feature: feature.toJSON(),
                });
                return true;
            }
            return false;
        };
        // Split into two loops for performance - the batched path avoids
        // repeated beginPath/fill calls and color lookups
        if (canBatch) {
            ctx.fillStyle = colorValue;
            ctx.beginPath();
            for (const feature of features.values()) {
                if (i++ % 100 === 0 && performance.now() - checkTime > 200) {
                    checkStopToken(stopToken);
                    checkTime = performance.now();
                }
                const x = (feature.get('start') - regionStart) * pxPerBp;
                const y = toY(feature.get('score'));
                if (addPoint(feature, x, y)) {
                    ctx.moveTo(x + POINT_RADIUS, y);
                    ctx.arc(x, y, POINT_RADIUS, 0, TWO_PI);
                }
            }
            ctx.fill();
        }
        else {
            ctx.fillStyle = colorValue;
            for (const feature of features.values()) {
                if (i++ % 100 === 0 && performance.now() - checkTime > 200) {
                    checkStopToken(stopToken);
                    checkTime = performance.now();
                }
                const x = (feature.get('start') - regionStart) * pxPerBp;
                const y = toY(feature.get('score'));
                if (addPoint(feature, x, y)) {
                    if (colorCallback) {
                        ctx.fillStyle = readConfObject(config, 'color', { feature });
                    }
                    ctx.beginPath();
                    ctx.arc(x, y, POINT_RADIUS, 0, TWO_PI);
                    ctx.fill();
                }
            }
        }
        return items;
    }
}
//# sourceMappingURL=LinearManhattanRenderer.js.map