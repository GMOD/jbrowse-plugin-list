import React from 'react';
import type { JBrowsePluginProteinStructureModel } from '../model';
export interface ResidueCell {
    col: number;
    value: number;
}
/**
 * A per-residue scalar track (e.g. pLDDT, hydrophobicity) rendered as colored
 * cells aligned to the pairwise-alignment columns, matching the UniProt feature
 * tracks. Hovering drives the same structure hover as the feature tracks.
 */
declare const ResidueValueTrack: ({ cells, colorFor, formatValue, sequenceLength, model, }: {
    cells: ResidueCell[];
    colorFor: (value: number) => string;
    formatValue: (value: number) => string;
    sequenceLength: number;
    model: JBrowsePluginProteinStructureModel;
}) => React.JSX.Element;
export default ResidueValueTrack;
