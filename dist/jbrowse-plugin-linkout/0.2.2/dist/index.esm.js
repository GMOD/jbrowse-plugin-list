import Plugin from '@jbrowse/core/Plugin';
import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType';
import { isAbstractMenuManager } from '@jbrowse/core/util';
import React, { useState } from 'react';
import { ElementId } from '@jbrowse/core/util/types/mst';
import { types } from 'mobx-state-tree';

var version = "0.2.2";

function ReactComponent() {
    const [pushed, setPushed] = useState('');
    return (React.createElement("div", { style: { padding: 50 } },
        React.createElement("h1", null, "Hello plugin developers!"),
        React.createElement("button", { onClick: () => {
                setPushed('Whoa! You pushed the button!');
            } }, "Push the button"),
        React.createElement("p", null, pushed)));
}

const stateModel = types
    .model({
    id: ElementId,
    type: types.literal('HelloView'),
})
    .actions(() => ({
    // unused but required by your view
    setWidth() { },
}));

class TestPlugin extends Plugin {
    name = "Linkout";
    version = version;
    install(pluginManager) {
        pluginManager.addViewType(() => {
            return new ViewType({
                name: 'HelloView',
                stateModel: stateModel,
                ReactComponent: ReactComponent,
            });
        });
    }
    configure(pluginManager) {
        // Add a new function called 'linkout' to the plugin manager's Jexl engine
        pluginManager.jexl.addFunction('linkout', (dict, feature) => {
            if (!feature.dbxref) { // If the feature has no dbxref, return an empty string
                return '';
            }
            const dbxrefs = Array.isArray(feature.dbxref) // Convert the dbxref(s) to an array, if necessary
                ? feature.dbxref
                : [feature.dbxref];
            // Map over the array of dbxrefs and create an HTML link for each one, using the root and content of the dbxref
            return dbxrefs.map(dbxref => {
                const [root, content1, content2] = dbxref.split(':');
                const link = dict[root]; // Look up the link URL in the dictionary using the root of the dbxref
                return content2 ? `<a href=${link}${content1}:${content2}>${dbxref}</a>` : `<a href=${link}${content1}>${dbxref}</a>`;
            });
        });
        if (isAbstractMenuManager(pluginManager.rootModel)) {
            pluginManager.rootModel.appendToMenu('Add', {
                label: 'Hello View',
                onClick: (session) => {
                    session.addView('HelloView', {});
                },
            });
        }
    }
}

export { TestPlugin as default };
//# sourceMappingURL=index.esm.js.map
