import { CHAR_WIDTH } from '../constants';
/**
 * Shared mouse handlers for tracks that map cursor x-position to an alignment
 * column and drive the structure hover. Optionally reports the hovered column
 * (used by tracks that show a per-column tooltip).
 */
export default function useAlignmentColumnHover(model, sequenceLength, onCol) {
    return {
        onMouseMove: (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const col = Math.floor((e.clientX - rect.left) / CHAR_WIDTH);
            const inRange = col >= 0 && col < sequenceLength;
            onCol?.(inRange ? col : undefined);
            if (inRange) {
                model.hoverAlignmentPosition(col);
            }
        },
        onMouseLeave: () => {
            onCol?.(undefined);
            model.setHoveredPosition(undefined);
        },
    };
}
