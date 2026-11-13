import Plugin from '@jbrowse/core/Plugin';
import { ConfigurationSchema } from '@jbrowse/core/configuration';
import { types } from '@jbrowse/mobx-state-tree';
import AddHighlightModelF from './AddHighlightModel';
import AlignTranscriptRpcF from './AlignTranscriptRpc';
import AlphaFoldConfidenceAdapterF from './AlphaFoldConfidenceAdapter';
import AlphaMissensePathogenicityAdapterF from './AlphaMissensePathogenicityAdapter';
import LaunchProteinViewF from './LaunchProteinView';
import LaunchProteinViewExtensionPointF from './LaunchProteinViewExtensionPoint';
import LaunchProteinAnnotationViewF from './LaunchProteinViewExtensionPoint/annotationView';
import Protein1DLinkageF from './Protein1DLinkage';
import ProteinViewF from './ProteinView';
import { version } from './version';
export default class ProteinViewer extends Plugin {
    name = 'ProteinViewer';
    version = version;
    install(pluginManager) {
        ProteinViewF(pluginManager);
        LaunchProteinViewF(pluginManager);
        LaunchProteinViewExtensionPointF(pluginManager);
        LaunchProteinAnnotationViewF(pluginManager);
        Protein1DLinkageF(pluginManager);
        AddHighlightModelF(pluginManager);
        AlphaFoldConfidenceAdapterF(pluginManager);
        AlphaMissensePathogenicityAdapterF(pluginManager);
        AlignTranscriptRpcF(pluginManager);
    }
    configure(_pluginManager) { }
    // what a site declares under `protein3d` in its config.json; the dialog and
    // the launch read it, and the mapping files load on first use
    rootConfigurationSchema = () => ({
        protein3d: ConfigurationSchema('Protein3d', {
            datasets: types.maybe(types.array(ConfigurationSchema('Protein3dDataset', {
                datasetId: { type: 'string', defaultValue: '' },
                name: { type: 'string', defaultValue: '' },
                description: { type: 'string', defaultValue: '' },
                mappingLocation: {
                    type: 'fileLocation',
                    defaultValue: { uri: '', locationType: 'UriLocation' },
                },
            }))),
        }),
    });
}
