import React from 'react';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
type HighlightField = 'clickGenomeHighlights' | 'hoverGenomeHighlights';
export default function ProteinToGenomeHighlightInner({ model, field, }: {
    model: LinearGenomeViewModel;
    field: HighlightField;
}): React.JSX.Element | null;
export {};
