import type { AnnotationFeature } from '@apollo-annotation/mst';
import type { BlockSet } from '@jbrowse/core/util/blockTypes';
import type { Theme } from '@mui/material';
import type { ApolloSessionModel, HoveredFeature } from '../session';
export declare function drawSequenceOverlay(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, hoveredFeature: HoveredFeature | undefined, selectedFeature: AnnotationFeature | undefined, rowHeight: number, theme: Theme, session: ApolloSessionModel, bpPerPx: number, offsetPx: number, dynamicBlocks: BlockSet): void;
//# sourceMappingURL=drawSequenceOverlay.d.ts.map