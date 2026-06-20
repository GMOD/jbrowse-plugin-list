import type { RenderedBase, RenderingContext } from './types';
export declare function createRenderedBaseCoords(xPos: number, rowTop: number, context: RenderingContext): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
};
export declare function shouldAddToSpatialIndex(xPos: number, rowIndex: number, context: RenderingContext, bypassDistanceFilter?: boolean): boolean;
export declare function addToSpatialIndex(context: RenderingContext, minX: number, minY: number, maxX: number, maxY: number, rowIndex: number, renderedBase: RenderedBase): void;
