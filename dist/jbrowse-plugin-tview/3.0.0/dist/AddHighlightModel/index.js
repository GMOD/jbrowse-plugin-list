import React from 'react';
import { getSession } from '@jbrowse/core/util';
import MsaToGenomeHighlight from './MsaToGenomeHighlight';
import { isTView } from '../TViewPanel/model';
export default function AddHighlightComponentsModelF(pluginManager) {
    pluginManager.contributeToExtensionPoint('LinearGenomeView-TracksContainerComponent', ({ model }) => getSession(model).views.some(v => isTView(v) && v.connectedViewId === model.id) ? (React.createElement(MsaToGenomeHighlight, { key: "tview_highlights", model: model })) : undefined);
}
//# sourceMappingURL=index.js.map