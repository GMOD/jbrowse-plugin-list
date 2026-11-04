import { lazy } from 'react';
import { ViewType } from '@jbrowse/core/pluggableElementTypes';
const ReactComponent = lazy(() => import('./components/ProteinView'));
export default function ProteinViewF(pluginManager) {
    pluginManager.addViewType(() => {
        return new ViewType({
            name: 'ProteinView',
            displayName: 'Protein view',
            stateModel: () => import('./model').then(m => m.default()),
            ReactComponent,
        });
    });
}
