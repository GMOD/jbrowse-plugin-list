'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Plugin = require('@jbrowse/core/Plugin');
var ViewType = require('@jbrowse/core/pluggableElementTypes/ViewType');
var util = require('@jbrowse/core/util');
var React = require('react');
var mst = require('@jbrowse/core/util/types/mst');
var mobxStateTree = require('mobx-state-tree');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Plugin__default = /*#__PURE__*/_interopDefaultLegacy(Plugin);
var ViewType__default = /*#__PURE__*/_interopDefaultLegacy(ViewType);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

var version = "0.2.2";

function ReactComponent() {
    const [pushed, setPushed] = React.useState('');
    return (React__default["default"].createElement("div", { style: { padding: 50 } },
        React__default["default"].createElement("h1", null, "Hello plugin developers!"),
        React__default["default"].createElement("button", { onClick: () => {
                setPushed('Whoa! You pushed the button!');
            } }, "Push the button"),
        React__default["default"].createElement("p", null, pushed)));
}

const stateModel = mobxStateTree.types
    .model({
    id: mst.ElementId,
    type: mobxStateTree.types.literal('HelloView'),
})
    .actions(() => ({
    // unused but required by your view
    setWidth() { },
}));

class TestPlugin extends Plugin__default["default"] {
    name = "Linkout";
    version = version;
    install(pluginManager) {
        pluginManager.addViewType(() => {
            return new ViewType__default["default"]({
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
        if (util.isAbstractMenuManager(pluginManager.rootModel)) {
            pluginManager.rootModel.appendToMenu('Add', {
                label: 'Hello View',
                onClick: (session) => {
                    session.addView('HelloView', {});
                },
            });
        }
    }
}

exports["default"] = TestPlugin;
//# sourceMappingURL=jbrowse-plugin-linkout.cjs.development.js.map
