import type { RenderingContext } from './types';
/**
 * Renders colored rectangles for mismatches and matches (when showAllLetters is true)
 */
export declare function renderMismatches(context: RenderingContext, alignment: string, seq: string, leftPx: number, rowTop: number, rowIndex: number, alignmentStart: number, chr: string): void;
