import React from 'react';
import type { LinearMafDisplayModel } from '../stateModel';
declare const MAFTooltip: ({ model, mouseX, origMouseX, }: {
    mouseX: number;
    model: LinearMafDisplayModel;
    origMouseX?: number;
}) => React.JSX.Element | null;
export default MAFTooltip;
