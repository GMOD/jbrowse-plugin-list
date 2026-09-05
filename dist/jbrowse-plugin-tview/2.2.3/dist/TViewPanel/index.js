import { lazy } from 'react';
import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType';
import stateModelFactory from './model';
// lazies
const TViewPanel = lazy(() => import('./components/TViewPanel'));
export default function TViewF(pluginManager) {
    pluginManager.addViewType(() => {
        return new ViewType({
            name: 'TView',
            stateModel: stateModelFactory(),
            ReactComponent: TViewPanel,
        });
    });
}
//# sourceMappingURL=index.js.map