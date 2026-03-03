import React from 'react';
import type { AnyConfigurationModel } from '@jbrowse/core/configuration';
import type { Feature } from '@jbrowse/core/util';
export interface Props {
    feature: Feature;
    model: Model;
}
export interface Model {
    configuration: AnyConfigurationModel;
    featureUnderMouse?: Feature;
}
declare const TooltipComponent: (props: {
    model: Model;
    height: number;
    offsetMouseCoord: [number, number];
    clientMouseCoord: [number, number];
    clientRect?: DOMRect;
}) => React.JSX.Element;
export default TooltipComponent;
