import type { NodeWithIds } from './types';
import type { HierarchyNode } from 'd3-hierarchy';
export interface HoveredInfo {
    sampleId: string;
    sampleLabel: string;
    pos: number;
    base: string;
    chr: string;
    isInsertion?: boolean;
    isLargeInsertion?: boolean;
    [key: string]: unknown;
}
export interface GenomicPosition {
    refName: string;
    coord: number;
}
/**
 * Generates tooltip HTML content for MAF alignments
 * Truncates long sequences to 50 characters, with ellipses added if display exceeds 20 characters
 * @param hoveredInfo - Information about the hovered base/position
 * @param p1 - Start position (for range selections)
 * @param p2 - End position (current mouse position)
 * @returns HTML string for tooltip content
 */
export declare function generateTooltipContent(hoveredInfo: HoveredInfo | undefined, p1: GenomicPosition | undefined, p2: GenomicPosition): string;
export declare function maxLength(d: HierarchyNode<NodeWithIds>): number;
export declare function setBrLength(d: HierarchyNode<NodeWithIds>, y0: number, k: number): void;
export declare function computeNodeDescendantNames<T extends {
    name: string;
}>(root: HierarchyNode<T>): Map<HierarchyNode<T>, string[]>;
