import React from 'react';
import type { JBrowsePluginProteinStructureModel } from '../model';
/**
 * Collapse a set of matching columns into contiguous [start, end) runs. A
 * well-matched alignment is nearly all one run, so this turns one DOM node per
 * residue into a handful for the whole overlay.
 */
export declare function matchRuns(columns: Iterable<number>): {
    start: number;
    end: number;
}[];
export declare const AlignmentHighlights: ({ model, strLength, height, }: {
    model: JBrowsePluginProteinStructureModel;
    strLength: number;
    height: number;
}) => React.JSX.Element;
declare const SplitString: ({ model, str, }: {
    model: JBrowsePluginProteinStructureModel;
    str: string;
}) => React.JSX.Element;
export default SplitString;
