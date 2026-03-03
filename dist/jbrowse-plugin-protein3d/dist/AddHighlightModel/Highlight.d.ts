import React from 'react';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
declare const Highlight: ({ assemblyName, start, end, refName, model, }: {
    model: LinearGenomeViewModel;
    assemblyName: string;
    start: number;
    end: number;
    refName: string;
}) => React.JSX.Element | null;
export default Highlight;
