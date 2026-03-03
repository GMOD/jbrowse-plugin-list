import React from 'react';
import type { JBrowsePluginProteinStructureModel } from '../model';
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
