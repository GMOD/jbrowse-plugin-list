import React from 'react';
import { ConfigurationSchema } from '@jbrowse/core/configuration';
import stateModel from './model';
import ReactComponent from './components/GDCFilterComponent';
const GDCFilterWidgetPlugin = (jbrowse) => {
    return {
        configSchema: ConfigurationSchema('GDCFilterWidget', {}),
        ReactComponent,
        stateModel: jbrowse.load(stateModel),
        HeadingComponent: () => React.createElement(React.Fragment, null, "GDC Filters"),
    };
};
export default GDCFilterWidgetPlugin;
//# sourceMappingURL=index.js.map