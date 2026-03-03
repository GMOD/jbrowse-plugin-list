interface DragSelectionState {
    isDragging: boolean;
    dragStartX: number | undefined;
    dragEndX: number | undefined;
    dragStartY: number | undefined;
    dragEndY: number | undefined;
    showSelectionBox: boolean;
    mouseX: number | undefined;
    mouseY: number | undefined;
}
interface DragSelectionHandlers {
    handleMouseDown: (event: React.MouseEvent) => void;
    handleMouseMove: (event: React.MouseEvent) => void;
    handleMouseUp: (event: React.MouseEvent) => void;
    handleMouseLeave: () => void;
    clearSelectionBox: () => void;
}
interface ContextCoord {
    coord: [number, number];
    dragStartX: number;
    dragEndX: number;
    dragStartY: number;
    dragEndY: number;
}
export declare function useDragSelection(ref: React.RefObject<HTMLDivElement | null>): DragSelectionState & DragSelectionHandlers & {
    contextCoord: ContextCoord | undefined;
    setContextCoord: (coord: ContextCoord | undefined) => void;
};
export {};
