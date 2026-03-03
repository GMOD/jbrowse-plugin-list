import React from 'react';
import { LinearGenomeMultilevelViewModel } from '../../LinearGenomeMultilevelView/model';
import { MultilevelLinearViewModel } from '../model';
type MLLV = MultilevelLinearViewModel;
type LGMLV = LinearGenomeMultilevelViewModel;
export declare function PanControls({ model }: {
    model: LGMLV;
}): React.JSX.Element;
declare const Controls: ({ view, model, polygonPoints, ExtraControls, }: {
    view: LGMLV;
    model: MLLV;
    polygonPoints?: any;
    ExtraControls?: React.ReactNode;
}) => React.JSX.Element;
export default Controls;
