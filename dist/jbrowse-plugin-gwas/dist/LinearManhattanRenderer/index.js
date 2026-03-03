import ManhattanPlotRenderer from './LinearManhattanRenderer';
import LinearManhattanRendering from './LinearManhattanRendering';
import { configSchema } from './configSchema';
export default function LinearManhattanRendererF(pluginManager) {
    pluginManager.addRendererType(() => new ManhattanPlotRenderer({
        name: 'LinearManhattanRenderer',
        ReactComponent: LinearManhattanRendering,
        configSchema,
        pluginManager,
    }));
}
//# sourceMappingURL=index.js.map