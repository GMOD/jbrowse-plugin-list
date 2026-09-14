import React from 'react';
import type { HighlightRegion } from './util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
declare const Highlight: ({ region, model, }: {
    model: LinearGenomeViewModel;
    region: HighlightRegion;
}) => React.JSX.Element | null;
export default Highlight;
