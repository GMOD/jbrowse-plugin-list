import React from 'react';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
/** a band over one genome interval, positioned in the tracks container */
declare const Highlight: ({ model, refName, start, end, }: {
    model: LinearGenomeViewModel;
    refName: string;
    start: number;
    end: number;
}) => React.JSX.Element | null;
export default Highlight;
