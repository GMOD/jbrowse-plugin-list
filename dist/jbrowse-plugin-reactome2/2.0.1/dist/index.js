import Plugin from '@jbrowse/core/Plugin';
import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType';
import { isAbstractMenuManager } from '@jbrowse/core/util';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { ReactComponent, stateModel } from './ReactomeView';
import { version } from './version';
export default class ReactomePlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.name = 'ReactomePlugin';
        this.version = version;
    }
    install(pluginManager) {
        pluginManager.addViewType(() => new ViewType({
            name: 'ReactomeView',
            stateModel,
            ReactComponent,
        }));
    }
    configure(pluginManager) {
        if (isAbstractMenuManager(pluginManager.rootModel)) {
            pluginManager.rootModel.appendToMenu('Add', {
                label: 'Reactome view',
                icon: ShowChartIcon,
                onClick: (session) => {
                    session.addView('ReactomeView', { displayName: 'Reactome View' });
                },
            });
        }
    }
}
//# sourceMappingURL=index.js.map