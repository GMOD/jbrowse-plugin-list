import React from 'react';
import type { JBrowsePluginProteinStructureModel } from '../model';
/** Which alignment columns get a tick, and which of those a label, in the
 * structure's author residue numbering (see residueNumber), so the ruler reads
 * like the paper and Mol*'s hover label. Pure so it can be tested without the
 * DOM. */
export declare function rulerTicks(alignmentToStructure: Record<number, number> | undefined, columns: number, residueNumber: (pos: number) => number): {
    col: number;
    label?: string;
}[];
declare const AlignmentRuler: ({ model, columns, }: {
    model: JBrowsePluginProteinStructureModel;
    columns: number;
}) => React.JSX.Element;
export default AlignmentRuler;
