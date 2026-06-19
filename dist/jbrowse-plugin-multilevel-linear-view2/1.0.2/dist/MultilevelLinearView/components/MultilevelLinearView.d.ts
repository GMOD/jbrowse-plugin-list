import React from 'react';
import { MultilevelLinearViewModel } from '../model';
type MLLV = MultilevelLinearViewModel;
declare const MultilevelLinearView: (props: {
    model: MLLV;
    ExtraButtons?: React.ReactNode;
}) => React.JSX.Element;
export default MultilevelLinearView;
