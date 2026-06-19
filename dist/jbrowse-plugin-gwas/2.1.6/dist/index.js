import Plugin from '@jbrowse/core/Plugin';
import GWASAdapterF from './GWASAdapter';
import GWASAddTrackComponentF from './GWASAddTrackComponent';
import GWASTrackF from './GWASTrack';
import GuessAdapterF from './GuessAdapter';
import LinearManhattanDisplayF from './LinearManhattanDisplay';
import JexlMouseoverF from './LinearManhattanDisplay/jexlMouseover';
import LinearManhattanRendererF from './LinearManhattanRenderer';
import { version } from '../package.json';
export default class GWASPlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.name = 'GWASPlugin';
        this.version = version;
    }
    install(pluginManager) {
        GWASAdapterF(pluginManager);
        GWASAddTrackComponentF(pluginManager);
        GWASTrackF(pluginManager);
        GuessAdapterF(pluginManager);
        LinearManhattanDisplayF(pluginManager);
        LinearManhattanRendererF(pluginManager);
        JexlMouseoverF(pluginManager);
    }
}
//# sourceMappingURL=index.js.map