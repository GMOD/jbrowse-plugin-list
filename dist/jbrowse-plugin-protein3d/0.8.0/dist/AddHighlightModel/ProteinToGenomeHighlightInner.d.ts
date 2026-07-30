import React from 'react';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
type HighlightField = 'clickGenomeHighlights' | 'hoverGenomeHighlights';
declare const ProteinToGenomeHighlightInner: ({ model, field, }: {
    model: LinearGenomeViewModel;
    field: HighlightField;
}) => React.JSX.Element | null;
export default ProteinToGenomeHighlightInner;
