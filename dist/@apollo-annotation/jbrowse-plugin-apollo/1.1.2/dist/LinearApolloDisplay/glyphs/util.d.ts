import type { AnnotationFeature } from '@apollo-annotation/mst';
import type { ContentBlock } from '@jbrowse/core/util/blockTypes';
import type { LinearApolloDisplay } from '../stateModel';
import type { MousePosition } from '../stateModel/mouseEvents';
import type { OverlayType } from './Glyph';
export declare function getLeftPx(display: LinearApolloDisplay, feature: {
    max: number;
    min: number;
}, block: ContentBlock): number;
export declare function getFeatureBox(display: LinearApolloDisplay, feature: {
    max: number;
    min: number;
}, row: number, block: ContentBlock): [number, number, number, number];
export declare function drawOverlayBox(display: LinearApolloDisplay, ctx: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, feature: AnnotationFeature, overlayType: OverlayType): void;
/**
 * Perform a canvas strokeRect, but have the stroke be contained within the
 * given rect instead of centered on it.
 */
export declare function strokeRectInner(ctx: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, color: string): void;
/** @returns undefined if mouse not on the edge of this feature, otherwise 'start' or 'end' depending on which edge */
export declare function isMouseOnFeatureEdge(mousePosition: MousePosition, feature: {
    min: number;
    max: number;
}, stateModel: LinearApolloDisplay): "min" | "max" | undefined;
//# sourceMappingURL=util.d.ts.map