export type { AlignmentRecord, GenomicRegion, Sample } from '../../types';
export declare const FONT_CONFIG = "bold 10px Courier New,monospace";
export declare const CHAR_SIZE_WIDTH = 10;
export declare const GAP_STROKE_OFFSET = 0.4;
export declare const INSERTION_LINE_WIDTH = 1;
export declare const INSERTION_BORDER_WIDTH = 2;
export declare const INSERTION_PADDING = 2;
export declare const VERTICAL_TEXT_OFFSET = 3;
export declare const LARGE_INSERTION_THRESHOLD = 10;
export declare const HIGH_ZOOM_THRESHOLD = 0.2;
export declare const MIN_ROW_HEIGHT_FOR_BORDERS = 5;
export declare const HIGH_BP_PER_PX_THRESHOLD = 10;
export declare const INSERTION_BORDER_HEIGHT = 5;
export declare const MIN_X_DISTANCE = 1;
export interface RenderedBase {
    pos: number;
    chr: string;
    base: string;
    rowIndex: number;
    isInsertion?: boolean;
    isLargeInsertion?: boolean;
}
/**
 * Shared rendering context containing all necessary parameters for rendering operations
 */
export interface RenderingContext {
    ctx: CanvasRenderingContext2D;
    scale: number;
    bpPerPx: number;
    canvasWidth: number;
    rowHeight: number;
    h: number;
    hp2: number;
    offset: number;
    colorForBase: Record<string, string>;
    contrastForBase: Record<string, string>;
    showAllLetters: boolean;
    mismatchRendering: boolean;
    showAsUpperCase: boolean;
    charWidth: number;
    charHeight: number;
    spatialIndex: RenderedBase[];
    spatialIndexCoords: number[];
    lastInsertedXPerRow: Map<number, number>;
}
