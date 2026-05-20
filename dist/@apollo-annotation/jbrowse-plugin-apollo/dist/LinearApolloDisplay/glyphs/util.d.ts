import type { ContentBlock } from '@jbrowse/core/util/blockTypes';
import type { LinearApolloDisplay } from '../stateModel';
export declare function getLeftPx(display: LinearApolloDisplay, feature: {
    max: number;
    min: number;
}, block: ContentBlock): number;
/**
 * Perform a canvas strokeRect, but have the stroke be contained within the
 * given rect instead of centered on it.
 */
export declare function strokeRectInner(ctx: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, color: string): void;
//# sourceMappingURL=util.d.ts.map