import Plugin from '@jbrowse/core/Plugin';
import AddHighlightModelF from './AddHighlightModel';
import AlphaFoldConfidenceAdapterF from './AlphaFoldConfidenceAdapter';
import AlphaMissensePathogenicityAdapterF from './AlphaMissensePathogenicityAdapter';
import LaunchProteinViewF from './LaunchProteinView';
import LaunchProteinViewExtensionPointF from './LaunchProteinViewExtensionPoint';
import ProteinViewF from './ProteinView';
import UniProtVariationAdapterF from './UniProtVariationAdapter';
import { version } from './version';
export default class ProteinViewer extends Plugin {
    name = 'ProteinViewer';
    version = version;
    install(pluginManager) {
        ProteinViewF(pluginManager);
        LaunchProteinViewF(pluginManager);
        LaunchProteinViewExtensionPointF(pluginManager);
        AddHighlightModelF(pluginManager);
        AlphaFoldConfidenceAdapterF(pluginManager);
        AlphaMissensePathogenicityAdapterF(pluginManager);
        UniProtVariationAdapterF(pluginManager);
    }
    configure(_pluginManager) { }
}
//# sourceMappingURL=index.js.map