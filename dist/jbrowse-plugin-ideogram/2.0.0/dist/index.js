import Plugin from '@jbrowse/core/Plugin';
import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType';
import WidgetType from '@jbrowse/core/pluggableElementTypes/WidgetType';
import { isAbstractMenuManager } from '@jbrowse/core/util';
import PauseIcon from '@mui/icons-material/Pause';
import IdeogramFeatureWidgetF from './IdeogramFeatureWidget';
import IdeogramView from './IdeogramView';
import stateModelFactory from './model';
// The generated src/version.ts, as in jbrowse-plugin-gwas, rather than
// ../package.json. The `version` npm script writes this file on every
// `npm version`, and importing the manifest instead inlines the whole thing
// (every dependency range included) into the bundle to read one string.
import { version } from './version';
export default class IdeogramPlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.name = 'IdeogramPlugin';
        this.version = version;
    }
    install(pluginManager) {
        pluginManager.addViewType(() => new ViewType({
            name: 'IdeogramView',
            stateModel: stateModelFactory(pluginManager),
            ReactComponent: IdeogramView,
        }));
        pluginManager.addWidgetType(() => {
            return new WidgetType({
                name: 'IdeogramFeatureWidget',
                heading: 'Feature Details',
                ...IdeogramFeatureWidgetF(pluginManager),
            });
        });
    }
    configure(pluginManager) {
        if (isAbstractMenuManager(pluginManager.rootModel)) {
            pluginManager.rootModel.appendToSubMenu(['Add'], {
                label: 'Ideogram view',
                icon: PauseIcon,
                onClick: (session) => {
                    // addView returns the view it made, so there is no need to reach back
                    // into session.views by index and no need for a ts-ignore
                    session.addView('IdeogramView', {}).setDisplayName('Ideogram View');
                },
            });
        }
    }
}
//# sourceMappingURL=index.js.map