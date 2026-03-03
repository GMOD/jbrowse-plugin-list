import { useCallback, useEffect, useState } from 'react';
const MIN_DRAG_DISTANCE = 3;
export function useDragSelection(ref) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState();
    const [dragEndX, setDragEndX] = useState();
    const [dragStartY, setDragStartY] = useState();
    const [dragEndY, setDragEndY] = useState();
    const [showSelectionBox, setShowSelectionBox] = useState(false);
    const [mouseX, setMouseX] = useState();
    const [mouseY, setMouseY] = useState();
    const [contextCoord, setContextCoord] = useState();
    const clearSelectionBox = useCallback(() => {
        setShowSelectionBox(false);
        setDragStartX(undefined);
        setDragEndX(undefined);
        setDragStartY(undefined);
        setDragEndY(undefined);
    }, []);
    const handleMouseDown = useCallback((event) => {
        if (event.shiftKey) {
            return;
        }
        const rect = ref.current?.getBoundingClientRect();
        const left = rect?.left || 0;
        const top = rect?.top || 0;
        const clientX = event.clientX - left;
        const clientY = event.clientY - top;
        setShowSelectionBox(false);
        setIsDragging(true);
        setDragStartX(clientX);
        setDragEndX(clientX);
        setDragStartY(clientY);
        setDragEndY(clientY);
        event.stopPropagation();
    }, [ref]);
    const handleMouseMove = useCallback((event) => {
        const rect = ref.current?.getBoundingClientRect();
        const top = rect?.top || 0;
        const left = rect?.left || 0;
        const clientX = event.clientX - left;
        const clientY = event.clientY - top;
        setMouseY(clientY);
        setMouseX(clientX);
        if (isDragging) {
            setDragEndX(clientX);
            setDragEndY(clientY);
        }
    }, [ref, isDragging]);
    const handleMouseUp = useCallback((event) => {
        if (isDragging &&
            dragStartX !== undefined &&
            dragEndX !== undefined &&
            dragStartY !== undefined &&
            dragEndY !== undefined) {
            const dragDistanceX = Math.abs(dragEndX - dragStartX);
            if (dragDistanceX > MIN_DRAG_DISTANCE) {
                setContextCoord({
                    coord: [event.clientX, event.clientY],
                    dragEndX: event.clientX,
                    dragStartX: dragStartX,
                    dragStartY: dragStartY,
                    dragEndY: dragEndY,
                });
                setShowSelectionBox(true);
            }
            else {
                clearSelectionBox();
            }
        }
        setIsDragging(false);
    }, [isDragging, dragStartX, dragEndX, dragStartY, dragEndY, clearSelectionBox]);
    const handleMouseLeave = useCallback(() => {
        setMouseY(undefined);
        setMouseX(undefined);
        setIsDragging(false);
    }, []);
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && showSelectionBox) {
                clearSelectionBox();
            }
        };
        const handleClickOutside = (event) => {
            if (ref.current &&
                !ref.current.contains(event.target) &&
                showSelectionBox) {
                clearSelectionBox();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [ref, showSelectionBox, clearSelectionBox]);
    const dragDistance = dragStartX !== undefined && dragEndX !== undefined
        ? Math.abs(dragEndX - dragStartX)
        : 0;
    const hasDraggedEnough = dragDistance > MIN_DRAG_DISTANCE;
    return {
        isDragging: isDragging && hasDraggedEnough,
        dragStartX,
        dragEndX,
        dragStartY,
        dragEndY,
        showSelectionBox,
        mouseX,
        mouseY,
        contextCoord,
        setContextCoord,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleMouseLeave,
        clearSelectionBox,
    };
}
//# sourceMappingURL=useDragSelection.js.map