import { initKeys } from '../TViewPanel/init';
export default function LaunchTViewF(pluginManager) {
    /** #extensionPoint LaunchView-TView | async | Programmatically launch a tview */
    pluginManager.addToExtensionPoint('LaunchView-TView', (args) => {
        const { session, ...spec } = args;
        const init = {};
        const viewProps = {};
        for (const [key, value] of Object.entries(spec)) {
            ;
            (initKeys.has(key) ? init : viewProps)[key] = value;
        }
        session.addView('TView', {
            type: 'TView',
            ...viewProps,
            init: init,
        });
        return args;
    });
}
//# sourceMappingURL=launchView.js.map