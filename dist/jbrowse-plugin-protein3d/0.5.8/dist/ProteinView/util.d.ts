interface HoveredState {
    hoverPosition: {
        coord: number;
        refName: string;
    };
}
export declare function checkHovered(hovered: unknown): hovered is HoveredState;
export declare function invertMap(arg: Record<number, number>): Record<number, number>;
export {};
