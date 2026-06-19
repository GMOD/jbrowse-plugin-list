import React from 'react';
import { ConfigurationSchema } from '@jbrowse/core/configuration';
import ImportPanelModel from './model';
import ReactComponent from './ImportPanel';
const GDCSearchWidgetPlugin = (jbrowse) => {
    return {
        configSchema: ConfigurationSchema('GDCSearchWidget', {}),
        ReactComponent,
        stateModel: jbrowse.load(ImportPanelModel),
        HeadingComponent: () => React.createElement(React.Fragment, null, "GDC Data Import"),
    };
};
export default GDCSearchWidgetPlugin;
//# sourceMappingURL=index.js.map