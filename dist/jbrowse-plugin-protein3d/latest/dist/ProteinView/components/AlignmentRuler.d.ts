import React from 'react';
import type { JBrowsePluginProteinStructureModel } from '../model';
/** Which alignment columns get a tick, and which of those a label, in
 * 1-based structure residue numbers so the ruler reads like the 3D view's
 * hover text. Pure so it can be tested without the DOM. */
export declare function rulerTicks(alignmentToStructure: Record<number, number> | undefined, columns: number): {
    col: number;
    label?: string;
}[];
declare const AlignmentRuler: ({ model, columns, }: {
    model: JBrowsePluginProteinStructureModel;
    columns: number;
}) => React.JSX.Element;
export default AlignmentRuler;
