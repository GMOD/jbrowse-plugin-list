import React from 'react';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
type LGV = LinearGenomeViewModel;
declare const ProteinToGenomeClickHighlight: ({ model }: {
    model: LGV;
}) => React.JSX.Element | null;
export default ProteinToGenomeClickHighlight;
