import React from 'react';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
type LGV = LinearGenomeViewModel;
declare const HighlightComponents: ({ model, }: {
    model: LGV;
}) => React.JSX.Element;
export default HighlightComponents;
