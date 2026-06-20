import { lazy } from 'react';
const GWASAddTrackComponent = lazy(() => import('./GWASAddTrackComponent'));
export default function GWASAddTrackComponentF(pluginManager) {
    pluginManager.addToExtensionPoint('Core-addTrackComponent', 
    // @ts-expect-error
    (comp, { model }) => {
        return model.trackAdapterType === 'GWASAdapter'
            ? GWASAddTrackComponent
            : comp;
    });
}
//# sourceMappingURL=index.js.map