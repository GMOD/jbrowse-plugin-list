import LinearMafRenderer from './LinearMafRenderer';
import ReactComponent from './components/LinearMafRendering';
import configSchema from './configSchema';
export default function LinearMafRendererF(pluginManager) {
    pluginManager.addRendererType(() => new LinearMafRenderer({
        name: 'LinearMafRenderer',
        ReactComponent,
        configSchema,
        pluginManager,
    }));
}
//# sourceMappingURL=index.js.map