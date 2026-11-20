import { addExtensionElement } from '@jbrowse/core/ui';
import HighlightComponents from './HighlightComponents';
export default function AddHighlightModelF(pluginManager) {
    addExtensionElement(pluginManager, 'LinearGenomeView-TracksContainerComponent', HighlightComponents);
}
