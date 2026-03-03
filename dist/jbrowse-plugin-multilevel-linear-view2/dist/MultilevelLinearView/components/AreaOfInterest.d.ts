import React from 'react';
import { LinearGenomeMultilevelViewModel } from '../../LinearGenomeMultilevelView/model';
import { MultilevelLinearViewModel } from '../model';
type MLLV = MultilevelLinearViewModel;
type LGMLV = LinearGenomeMultilevelViewModel;
declare const AreaOfInterest: ({ model, view, polygonPoints, }: {
    model: MLLV;
    view: LGMLV;
    polygonPoints: any;
}) => React.JSX.Element;
export default AreaOfInterest;
