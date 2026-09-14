import type React from 'react';
import type { JBrowsePluginProteinStructureModel } from '../model';
/**
 * Shared mouse handlers for tracks that map cursor x-position to an alignment
 * column and drive the structure hover. Optionally reports the hovered column
 * (used by tracks that show a per-column tooltip).
 */
export default function useAlignmentColumnHover(model: JBrowsePluginProteinStructureModel, sequenceLength: number, onCol?: (col: number | undefined) => void): {
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    onMouseLeave: () => void;
};
