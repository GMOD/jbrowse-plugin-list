export interface HoverPosition {
    /** 1-based */
    coord: number;
    refName: string;
    /** the genome view the cursor is in, where the host says */
    viewId?: string;
}
/** the base a genome view's cursor is over, from `session.hovered` */
export declare function hoverPosition(hovered: unknown): HoverPosition | undefined;
/** how many entries of an ascending index are below `value` */
export declare function lowerBound(index: ArrayLike<number>, value: number): number;
